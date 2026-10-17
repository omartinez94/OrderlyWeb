import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  getAudioVolume,
  setAudioVolume,
  isAudioMuted,
  setAudioMuted,
  playBumpChime,
  playRecallTone,
  playErrorBuzzer,
  playNewOrderAlert,
  setMockAudioContext,
  unlockAudioContext,
} from "./audioFeedback";

function createMockAudioContext() {
  const destination = {};
  const createdOscillators: Array<{
    type: string;
    frequency: {
      setValueAtTime: ReturnType<typeof vi.fn>;
      exponentialRampToValueAtTime: ReturnType<typeof vi.fn>;
    };
    connect: ReturnType<typeof vi.fn>;
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
  }> = [];

  const createdGains: Array<{
    gain: {
      setValueAtTime: ReturnType<typeof vi.fn>;
      linearRampToValueAtTime: ReturnType<typeof vi.fn>;
      exponentialRampToValueAtTime: ReturnType<typeof vi.fn>;
    };
    connect: ReturnType<typeof vi.fn>;
  }> = [];

  const mockCtx = {
    currentTime: 10,
    state: "suspended" as AudioContextState,
    destination,
    resume: vi.fn().mockResolvedValue(undefined),
    createOscillator: vi.fn(() => {
      const osc = {
        type: "sine",
        frequency: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      };
      createdOscillators.push(osc);
      return osc;
    }),
    createGain: vi.fn(() => {
      const gain = {
        gain: {
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
      };
      createdGains.push(gain);
      return gain;
    }),
  } as unknown as AudioContext;

  return { mockCtx, createdOscillators, createdGains };
}

describe("audioFeedback", () => {
  beforeEach(() => {
    localStorage.clear();
    setMockAudioContext(null);
  });

  afterEach(() => {
    setMockAudioContext(null);
  });

  describe("volume and mute preferences", () => {
    it("manages volume setting and clamps to [0, 1]", () => {
      expect(getAudioVolume()).toBe(0.7);

      setAudioVolume(0.5);
      expect(getAudioVolume()).toBe(0.5);

      setAudioVolume(1.5);
      expect(getAudioVolume()).toBe(1.0);

      setAudioVolume(-0.2);
      expect(getAudioVolume()).toBe(0.0);
    });

    it("manages mute state in localStorage", () => {
      expect(isAudioMuted()).toBe(false);

      setAudioMuted(true);
      expect(isAudioMuted()).toBe(true);

      setAudioMuted(false);
      expect(isAudioMuted()).toBe(false);
    });
  });

  describe("synthesizer waveforms and oscillator lifecycle", () => {
    it("unlocks AudioContext when suspended", async () => {
      const { mockCtx } = createMockAudioContext();
      setMockAudioContext(mockCtx);

      await unlockAudioContext();
      expect(mockCtx.resume).toHaveBeenCalled();
    });

    it("synthesizes bump chime with dual frequency upward sweep", () => {
      const { mockCtx, createdOscillators } = createMockAudioContext();
      setMockAudioContext(mockCtx);

      playBumpChime();

      expect(createdOscillators).toHaveLength(1);
      const osc = createdOscillators[0];
      expect(osc.type).toBe("sine");
      expect(osc.frequency.setValueAtTime).toHaveBeenCalledWith(800, 10);
      expect(osc.frequency.exponentialRampToValueAtTime).toHaveBeenCalledWith(1200, 10.12);
      expect(osc.start).toHaveBeenCalledWith(10);
      expect(osc.stop).toHaveBeenCalledWith(10.12);
    });

    it("synthesizes recall tone with downward frequency sweep", () => {
      const { mockCtx, createdOscillators } = createMockAudioContext();
      setMockAudioContext(mockCtx);

      playRecallTone();

      expect(createdOscillators).toHaveLength(1);
      const osc = createdOscillators[0];
      expect(osc.type).toBe("sine");
      expect(osc.frequency.setValueAtTime).toHaveBeenCalledWith(900, 10);
      expect(osc.frequency.exponentialRampToValueAtTime).toHaveBeenCalledWith(600, 10.15);
      expect(osc.start).toHaveBeenCalledWith(10);
      expect(osc.stop).toHaveBeenCalledWith(10.15);
    });

    it("synthesizes error buzzer with sawtooth 200 Hz tone", () => {
      const { mockCtx, createdOscillators } = createMockAudioContext();
      setMockAudioContext(mockCtx);

      playErrorBuzzer();

      expect(createdOscillators).toHaveLength(1);
      const osc = createdOscillators[0];
      expect(osc.type).toBe("sawtooth");
      expect(osc.frequency.setValueAtTime).toHaveBeenCalledWith(200, 10);
      expect(osc.start).toHaveBeenCalledWith(10);
      expect(osc.stop).toHaveBeenCalledWith(10.25);
    });

    it("synthesizes new order alert with 3 sequential pulses (C5, E5, G5)", () => {
      const { mockCtx, createdOscillators } = createMockAudioContext();
      setMockAudioContext(mockCtx);

      playNewOrderAlert();

      expect(createdOscillators).toHaveLength(3);
      expect(createdOscillators[0].frequency.setValueAtTime).toHaveBeenCalledWith(523.25, 10);
      expect(createdOscillators[1].frequency.setValueAtTime).toHaveBeenCalledWith(
        659.25,
        expect.any(Number),
      );
      expect(createdOscillators[2].frequency.setValueAtTime).toHaveBeenCalledWith(
        783.99,
        expect.any(Number),
      );
    });

    it("does not create oscillators when audio is muted", () => {
      const { mockCtx, createdOscillators } = createMockAudioContext();
      setMockAudioContext(mockCtx);
      setAudioMuted(true);

      playBumpChime();
      playRecallTone();
      playErrorBuzzer();
      playNewOrderAlert();

      expect(createdOscillators).toHaveLength(0);
    });
  });
});
