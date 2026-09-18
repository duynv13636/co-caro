"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";
import type { Player } from "@/types/game";
import { createSoundEngine, type SoundEngine } from "@/lib/sound";
import { safeGetItem, safeSetItem } from "@/lib/utils";

const SOUND_KEY = "caro-ox:soundEnabled";
const SOUND_EVENT = "caro-ox:sound-change";

function getSnapshot(): boolean {
  return safeGetItem(SOUND_KEY) !== "false";
}

function getServerSnapshot(): boolean {
  return true;
}

function subscribe(callback: () => void) {
  window.addEventListener(SOUND_EVENT, callback);
  return () => window.removeEventListener(SOUND_EVENT, callback);
}

export function useSound() {
  const enabled = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const engineRef = useRef<SoundEngine | null>(null);

  const getEngine = useCallback((): SoundEngine => {
    if (!engineRef.current) {
      engineRef.current = createSoundEngine();
    }
    return engineRef.current;
  }, []);

  const playMove = useCallback(
    (player: Player) => {
      if (!enabled) return;
      getEngine().playMove(player);
    },
    [enabled, getEngine]
  );

  const playWin = useCallback(() => {
    if (!enabled) return;
    getEngine().playWin();
  }, [enabled, getEngine]);

  const playDraw = useCallback(() => {
    if (!enabled) return;
    getEngine().playDraw();
  }, [enabled, getEngine]);

  const playButton = useCallback(() => {
    if (!enabled) return;
    getEngine().playButton();
  }, [enabled, getEngine]);

  const toggleSound = useCallback(() => {
    safeSetItem(SOUND_KEY, String(!enabled));
    window.dispatchEvent(new Event(SOUND_EVENT));
  }, [enabled]);

  return { enabled, toggleSound, playMove, playWin, playDraw, playButton };
}
