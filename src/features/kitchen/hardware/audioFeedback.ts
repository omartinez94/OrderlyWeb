/**
 * Low-latency Web Audio API synthesizer for KDS feedback.
 *
 * Provides instant (<5ms) synthesized audio feedback without external audio files:
 *   - Bump Chime: Dual sine wave (800 Hz -> 1200 Hz, 120ms duration)
 *   - Recall Tone: Descending chime (900 Hz -> 600 Hz, 150ms duration)
 *   - Error Buzzer: Sawtooth wave (200 Hz, 250ms duration)
 *   - New Order Alert: Triple melodic pulse (C5: 523 Hz, E5: 659 Hz, G5: 784 Hz)
 *
 * Persists volume and mute state in localStorage.
 */

const STORAGE_KEYS = {
  VOLUME: "orderly_kds_audio_volume",
  MUTED: "orderly_kds_audio_muted",
} as const;

let audioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }

  return audioCtx;
}

export function setMockAudioContext(mock: AudioContext | null): void {
  audioCtx = mock;
}

export async function unlockAudioContext(): Promise<void> {
  const ctx = getAudioContext();
  if (ctx && ctx.state === "suspended") {
    try {
      await ctx.resume();
    } catch {
      // Browser autoplay policy might reject without direct gesture
    }
  }
}

export function getAudioVolume(): number {
  if (typeof window === "undefined" || !window.localStorage) return 0.7;
  const saved = localStorage.getItem(STORAGE_KEYS.VOLUME);
  if (!saved) return 0.7;
  const parsed = parseFloat(saved);
  return Number.isNaN(parsed) ? 0.7 : Math.min(1, Math.max(0, parsed));
}

export function setAudioVolume(volume: number): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  const clamped = Math.min(1, Math.max(0, volume));
  localStorage.setItem(STORAGE_KEYS.VOLUME, String(clamped));
}

export function isAudioMuted(): boolean {
  if (typeof window === "undefined" || !window.localStorage) return false;
  return localStorage.getItem(STORAGE_KEYS.MUTED) === "true";
}

export function setAudioMuted(muted: boolean): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  localStorage.setItem(STORAGE_KEYS.MUTED, muted ? "true" : "false");
}

/**
 * Plays a synthesized bump success chime (800 Hz -> 1200 Hz sine wave).
 */
export function playBumpChime(): void {
  if (isAudioMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  unlockAudioContext();

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const masterVolume = getAudioVolume();

    osc.type = "sine";
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.12);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.4 * masterVolume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  } catch {
    // Graceful fallback if audio is not permitted
  }
}

/**
 * Plays a synthesized recall tone (900 Hz -> 600 Hz descending chime).
 */
export function playRecallTone(): void {
  if (isAudioMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  unlockAudioContext();

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const masterVolume = getAudioVolume();

    osc.type = "sine";
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.35 * masterVolume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  } catch {
    // Ignored
  }
}

/**
 * Plays an invalid action / error buzzer tone (200 Hz sawtooth wave).
 */
export function playErrorBuzzer(): void {
  if (isAudioMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  unlockAudioContext();

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const masterVolume = getAudioVolume();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(200, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.3 * masterVolume, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  } catch {
    // Ignored
  }
}

/**
 * Plays a triple melodic pulse alert (C5: 523Hz, E5: 659Hz, G5: 784Hz) for new orders.
 */
export function playNewOrderAlert(): void {
  if (isAudioMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  unlockAudioContext();

  try {
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
    const noteDuration = 0.09;
    const noteGap = 0.04;
    const now = ctx.currentTime;
    const masterVolume = getAudioVolume();

    frequencies.forEach((freq, index) => {
      const noteStart = now + index * (noteDuration + noteGap);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, noteStart);

      gain.gain.setValueAtTime(0.001, noteStart);
      gain.gain.linearRampToValueAtTime(0.4 * masterVolume, noteStart + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + noteDuration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteStart);
      osc.stop(noteStart + noteDuration);
    });
  } catch {
    // Ignored
  }
}
