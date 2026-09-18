import type { Player } from "@/types/game";

export interface SoundEngine {
  playMove: (player: Player) => void;
  playWin: () => void;
  playDraw: () => void;
  playButton: () => void;
}

interface ToneOptions {
  frequency: number;
  duration: number;
  type?: OscillatorType;
  startTime?: number;
  gain?: number;
}

type AudioContextConstructor = typeof AudioContext;

export function createSoundEngine(): SoundEngine {
  let ctx: AudioContext | null = null;

  const getContext = (): AudioContext | null => {
    if (typeof window === "undefined") return null;
    try {
      const Ctor: AudioContextConstructor | undefined =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext;
      if (!Ctor) return null;
      if (!ctx) {
        ctx = new Ctor();
      }
      if (ctx.state === "suspended") {
        void ctx.resume();
      }
      return ctx;
    } catch {
      return null;
    }
  };

  const playTone = ({ frequency, duration, type = "sine", startTime = 0, gain = 0.15 }: ToneOptions) => {
    const audioCtx = getContext();
    if (!audioCtx) return;
    try {
      const now = audioCtx.currentTime + startTime;
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, now);
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(gain, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start(now);
      oscillator.stop(now + duration + 0.02);
    } catch {
      // audio failure must never break gameplay
    }
  };

  return {
    playMove: (player) => {
      playTone({ frequency: player === "X" ? 660 : 440, duration: 0.12, type: "sine", gain: 0.12 });
    },
    playWin: () => {
      [523.25, 659.25, 783.99, 1046.5].forEach((frequency, i) => {
        playTone({ frequency, duration: 0.25, type: "triangle", startTime: i * 0.1, gain: 0.14 });
      });
    },
    playDraw: () => {
      playTone({ frequency: 330, duration: 0.2, type: "sine", gain: 0.12 });
      playTone({ frequency: 294, duration: 0.3, type: "sine", startTime: 0.15, gain: 0.12 });
    },
    playButton: () => {
      playTone({ frequency: 880, duration: 0.05, type: "square", gain: 0.05 });
    },
  };
}
