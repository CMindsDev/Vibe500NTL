// Minimal WebAudio feedback for the onboarding wizard.
// Synthesized so we don't ship audio assets. Honors user mute toggle.

type Tone = "click" | "advance" | "success" | "error" | "select";

const STORAGE_KEY = "ntl500.onboarding.sound";

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const Ctor = (window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext) as
        | typeof AudioContext
        | undefined;
      if (!Ctor) return null;
      ctx = new Ctor();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored !== "off";
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
}

function beep(freq: number, duration = 0.08, type: OscillatorType = "sine", gain = 0.06, when = 0) {
  const audio = getCtx();
  if (!audio) return;
  const osc = audio.createOscillator();
  const env = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audio.currentTime + when);
  env.gain.setValueAtTime(0, audio.currentTime + when);
  env.gain.linearRampToValueAtTime(gain, audio.currentTime + when + 0.01);
  env.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + when + duration);
  osc.connect(env).connect(audio.destination);
  osc.start(audio.currentTime + when);
  osc.stop(audio.currentTime + when + duration + 0.02);
}

export function playSound(tone: Tone): void {
  if (!isSoundEnabled()) return;
  switch (tone) {
    case "click":
      beep(720, 0.05, "triangle", 0.04);
      break;
    case "select":
      beep(880, 0.06, "sine", 0.05);
      break;
    case "advance":
      beep(660, 0.07, "sine", 0.05);
      beep(990, 0.09, "sine", 0.06, 0.06);
      break;
    case "success":
      beep(660, 0.08, "sine", 0.06);
      beep(880, 0.08, "sine", 0.06, 0.08);
      beep(1320, 0.16, "sine", 0.06, 0.16);
      break;
    case "error":
      beep(220, 0.1, "sawtooth", 0.05);
      beep(180, 0.12, "sawtooth", 0.05, 0.08);
      break;
  }
}
