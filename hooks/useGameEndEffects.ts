"use client";

import { useEffect, useRef } from "react";
import type { Player } from "@/types/game";

interface UseGameEndEffectsOptions {
  onWin: (winner: Player) => void;
  onDraw: () => void;
}

/**
 * Fires onWin/onDraw exactly once per round, driven purely by the winner/isDraw
 * values — works whether the round ended locally or arrived via a realtime sync.
 */
export function useGameEndEffects(
  winner: Player | null,
  isDraw: boolean,
  { onWin, onDraw }: UseGameEndEffectsOptions
) {
  const firedRef = useRef<"win" | "draw" | null>(null);

  useEffect(() => {
    if (winner) {
      if (firedRef.current !== "win") {
        firedRef.current = "win";
        onWin(winner);
      }
    } else if (isDraw) {
      if (firedRef.current !== "draw") {
        firedRef.current = "draw";
        onDraw();
      }
    } else {
      firedRef.current = null;
    }
  }, [winner, isDraw, onWin, onDraw]);
}
