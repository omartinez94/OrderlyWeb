import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Volume2, VolumeX, ShieldAlert, Sparkles, RefreshCw, Music } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from "../../../components/ui";
import { useBumpBar } from "../hardware/useBumpBar";
import {
  BUMP_BAR_PROFILES,
  DEFAULT_PROFILE_ID,
  KB9000_DEFAULT_PROFILE,
} from "../hardware/bumpBarProfiles";
import {
  getAudioVolume,
  setAudioVolume,
  isAudioMuted,
  setAudioMuted,
  playBumpChime,
} from "../hardware/audioFeedback";
import type { BumpBarAction, BumpBarProfile } from "../hardware/types";

const STORAGE_PROFILE_KEY = "orderly_kds_hardware_profile";

export function BumpBarSettingsWidget() {
  const { t } = useTranslation();

  // Profile State
  const [profileId, setProfileId] = useState<string>(() => {
    if (typeof window === "undefined" || !window.localStorage) return DEFAULT_PROFILE_ID;
    return localStorage.getItem(STORAGE_PROFILE_KEY) || DEFAULT_PROFILE_ID;
  });

  const activeProfile: BumpBarProfile = BUMP_BAR_PROFILES[profileId] || KB9000_DEFAULT_PROFILE;

  // Audio State
  const [volume, setVolumeState] = useState<number>(() => getAudioVolume());
  const [muted, setMutedState] = useState<boolean>(() => isAudioMuted());

  // WakeLock State
  const [wakeLockActive, setWakeLockActive] = useState<boolean>(false);
  const [wakeLockDenied, setWakeLockDenied] = useState<boolean>(false);
  const [wakeLockSentinel, setWakeLockSentinel] = useState<WakeLockSentinel | null>(null);

  // Live Key Test Matrix State
  const [activeTestKey, setActiveTestKey] = useState<string | null>(null);
  const [lastEventDetail, setLastEventDetail] = useState<string | null>(null);

  const handleProfileChange = (newId: string) => {
    setProfileId(newId);
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem(STORAGE_PROFILE_KEY, newId);
    }
    toast.success(`Active profile switched to ${BUMP_BAR_PROFILES[newId]?.name ?? newId}`);
  };

  const handleVolumeChange = (newVal: number) => {
    setVolumeState(newVal);
    setAudioVolume(newVal);
  };

  const handleMuteToggle = () => {
    const next = !muted;
    setMutedState(next);
    setAudioMuted(next);
    toast.info(next ? t("kds:settings.mute", "Mute all sounds") : "Audio unmuted");
  };

  // Screen WakeLock management
  const toggleWakeLock = async () => {
    if (wakeLockActive && wakeLockSentinel) {
      await wakeLockSentinel.release();
      setWakeLockSentinel(null);
      setWakeLockActive(false);
      return;
    }

    if (typeof navigator === "undefined" || !("wakeLock" in navigator)) {
      setWakeLockDenied(true);
      return;
    }

    try {
      const sentinel = await navigator.wakeLock.request("screen");
      setWakeLockSentinel(sentinel);
      setWakeLockActive(true);
      setWakeLockDenied(false);

      sentinel.addEventListener("release", () => {
        setWakeLockActive(false);
        setWakeLockSentinel(null);
      });
      toast.success(t("kds:wakeLock.enabled", "Screen WakeLock Active"));
    } catch {
      setWakeLockDenied(true);
      setWakeLockActive(false);
    }
  };

  // Clean up wake lock on unmount
  useEffect(() => {
    return () => {
      if (wakeLockSentinel) {
        wakeLockSentinel.release().catch(() => {});
      }
    };
  }, [wakeLockSentinel]);

  // Live Scan Code Key Detection
  const handleDetectedAction = useCallback((action: BumpBarAction) => {
    setActiveTestKey(action);
    setLastEventDetail(`${action} detected at ${new Date().toLocaleTimeString()}`);

    const timer = setTimeout(() => {
      setActiveTestKey(null);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useBumpBar({
    onAction: handleDetectedAction,
    profile: activeProfile,
  });

  const handleResetDefaults = () => {
    handleProfileChange(DEFAULT_PROFILE_ID);
    handleVolumeChange(0.7);
    if (muted) handleMuteToggle();
    toast.success(t("kds:settings.resetDefaults", "Reset to defaults"));
  };

  const testActions: { action: BumpBarAction; label: string; hotkey: string }[] = [
    { action: "SLOT_1", label: "Slot 1", hotkey: "1" },
    { action: "SLOT_2", label: "Slot 2", hotkey: "2" },
    { action: "SLOT_3", label: "Slot 3", hotkey: "3" },
    { action: "SLOT_4", label: "Slot 4", hotkey: "4" },
    { action: "SLOT_5", label: "Slot 5", hotkey: "5" },
    { action: "SLOT_6", label: "Slot 6", hotkey: "6" },
    { action: "SLOT_7", label: "Slot 7", hotkey: "7" },
    { action: "SLOT_8", label: "Slot 8", hotkey: "8" },
    { action: "BUMP_SELECTED", label: "BUMP", hotkey: "Enter / Ctrl" },
    { action: "RECALL_LAST", label: "RECALL", hotkey: "R / -" },
    { action: "NEXT_PAGE", label: "NEXT", hotkey: "PgDn" },
    { action: "PREV_PAGE", label: "PREV", hotkey: "PgUp" },
    { action: "SUMMARY_COUNTS", label: "SUMM", hotkey: "Space" },
    { action: "HOLD_ORDER", label: "HOLD", hotkey: "H" },
    { action: "ITEM_PREP_TOGGLE", label: "ITEM", hotkey: "I / 0" },
  ];

  return (
    <div className="flex w-full max-w-5xl flex-col gap-6">
      {/* WakeLock Denied Amber Alert Banner */}
      {wakeLockDenied && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-xl border border-amber-500/50 bg-amber-950/30 p-4 text-sm font-medium text-amber-200"
        >
          <ShieldAlert className="h-5 w-5 shrink-0 text-amber-400" aria-hidden="true" />
          <span>
            {t(
              "kds:wakeLock.deniedBanner",
              "Screen lock prevention unavailable — display may sleep.",
            )}
          </span>
        </div>
      )}

      {/* Screen WakeLock Card */}
      <Card className="bg-surface-elevated border-border-subtle">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="font-display text-primary text-lg">
              {t("kds:settings.wakeLockTitle", "Screen wake lock")}
            </CardTitle>
            <CardDescription>
              {t(
                "kds:settings.wakeLockDesc",
                "Keep screen awake continuously during kitchen operating hours.",
              )}
            </CardDescription>
          </div>
          <Badge
            variant={wakeLockActive ? "default" : "outline"}
            className={
              wakeLockActive
                ? "gap-1.5 bg-emerald-600 font-mono text-xs text-white"
                : "text-ink-muted font-mono text-xs"
            }
          >
            {wakeLockActive && (
              <span className="h-2 w-2 animate-ping rounded-full bg-emerald-300" />
            )}
            {wakeLockActive
              ? t("kds:wakeLock.enabled", "Screen WakeLock Active")
              : t("kds:wakeLock.disabled", "Screen WakeLock Inactive")}
          </Badge>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant={wakeLockActive ? "default" : "outline"}
            onClick={toggleWakeLock}
            className="text-sm font-medium"
          >
            {t("kds:settings.wakeLockToggle", "Prevent screen sleep")}
          </Button>
        </CardContent>
      </Card>

      {/* Audio Feedback Card */}
      <Card className="bg-surface-elevated border-border-subtle">
        <CardHeader>
          <CardTitle className="font-display text-primary flex items-center gap-2 text-lg">
            <Music className="text-accent h-5 w-5" aria-hidden="true" />
            {t("kds:settings.audioTitle", "Audio feedback")}
          </CardTitle>
          <CardDescription>
            {t(
              "kds:settings.audioDesc",
              "Synthesized acoustic signals for bumps, recalls, and new tickets.",
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-6">
            {/* Volume slider */}
            <div className="flex min-w-[200px] flex-col gap-1.5">
              <label htmlFor="kds-volume-slider" className="text-ink-muted font-mono text-xs">
                {t("kds:settings.volume", "Master volume")}: {Math.round(volume * 100)}%
              </label>
              <input
                id="kds-volume-slider"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                disabled={muted}
                className="accent-primary w-full cursor-pointer"
              />
            </div>

            {/* Mute button */}
            <Button
              type="button"
              variant={muted ? "default" : "outline"}
              size="sm"
              onClick={handleMuteToggle}
              className="h-9 gap-2 font-mono text-xs"
            >
              {muted ? (
                <>
                  <VolumeX className="h-4 w-4 text-rose-400" aria-hidden="true" />
                  <span>Unmute</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                  <span>{t("kds:settings.mute", "Mute all sounds")}</span>
                </>
              )}
            </Button>

            {/* Test sound button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => playBumpChime()}
              disabled={muted}
              className="h-9 gap-2 font-mono text-xs"
            >
              <Sparkles className="text-accent h-3.5 w-3.5" aria-hidden="true" />
              <span>{t("kds:settings.testAudio", "Test Chime")}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hardware Profile & Live Scan Code Test Matrix Card */}
      <Card className="bg-surface-elevated border-border-subtle">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-display text-primary text-lg">
              {t("kds:settings.hardwareTitle", "Hardware bump bar profile")}
            </CardTitle>
            <CardDescription>
              {t(
                "kds:settings.hardwareDesc",
                "Select commercial USB HID keypad profile or test keyboard inputs.",
              )}
            </CardDescription>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetDefaults}
            className="text-ink-muted hover:text-ink gap-1.5 font-mono text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t("kds:settings.resetDefaults", "Reset to defaults")}</span>
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {/* Preset Selector */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-ink text-sm font-semibold">
              {t("kds:settings.activeProfile", "Active profile")}:
            </span>
            {Object.values(BUMP_BAR_PROFILES).map((prof) => (
              <Button
                key={prof.id}
                type="button"
                variant={profileId === prof.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleProfileChange(prof.id)}
                className="font-mono text-xs"
              >
                {prof.name}
              </Button>
            ))}
          </div>

          {/* Interactive Live Scan Code Key Tester */}
          <div className="border-border-subtle bg-surface flex flex-col gap-3 rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-ink text-sm font-bold">
                  {t("kds:settings.testMatrixTitle", "Live scan code key tester")}
                </h2>
                <p className="text-ink-muted text-xs">
                  {t(
                    "kds:settings.testMatrixDesc",
                    "Press any physical bump bar key or virtual simulator button to verify input capture.",
                  )}
                </p>
              </div>
              <div
                className="rounded border border-slate-800 bg-slate-950 px-2.5 py-1 font-mono text-xs text-emerald-400"
                aria-live="polite"
              >
                {lastEventDetail || t("kds:settings.noneCaptured", "Press any key to test...")}
              </div>
            </div>

            {/* Visual Key Matrix */}
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-5">
              {testActions.map((item) => {
                const isLit = activeTestKey === item.action;
                return (
                  <div
                    key={item.action}
                    className={`flex flex-col items-center justify-center rounded-lg border p-2.5 transition-all select-none ${
                      isLit
                        ? "scale-105 border-emerald-400 bg-emerald-500 font-bold text-white shadow-lg ring-2 ring-emerald-300"
                        : "bg-surface-elevated border-border-subtle text-ink hover:border-border-strong"
                    }`}
                  >
                    <span className="text-xs leading-tight font-bold">{item.label}</span>
                    <span className="text-ink-muted font-mono text-[10px] opacity-80">
                      [{item.hotkey}]
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default BumpBarSettingsWidget;
