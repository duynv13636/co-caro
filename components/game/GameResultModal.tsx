"use client";

import { useEffect, useRef } from "react";
import type { Player } from "@/types/game";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface GameResultModalProps {
  open: boolean;
  winner: Player | null;
  isDraw: boolean;
  onPlayAgain: () => void;
  /** Set in online mode so the modal can tell the winner and the loser apart. Omit for local play. */
  mySymbol?: Player | null;
}

export function GameResultModal({ open, winner, isDraw, onPlayAgain, mySymbol }: GameResultModalProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) buttonRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onPlayAgain();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onPlayAgain]);

  if (!open) return null;

  // In local mode there's no `mySymbol`, so it's a shared screen — always celebratory.
  // In online mode, only the actual winner gets "You Win!"; the other player sees they lost.
  const isOnlineMode = mySymbol !== undefined && mySymbol !== null;
  const didIWin = !isOnlineMode || winner === mySymbol;

  const title = isDraw ? "It's a Draw" : didIWin ? "You Win!" : "You Lose";
  const subtitle = isDraw ? "No one wins this round." : `Player ${winner} wins the round`;
  const emoji = isDraw ? "🤝" : didIWin ? "🎉" : "😞";

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="game-result-title" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="animate-fade-in absolute inset-0 bg-slate-950/40 dark:bg-black/60 backdrop-blur-sm" />
      <div className="animate-modal-in relative w-full max-w-sm rounded-3xl border border-slate-900/10 dark:border-white/10 bg-white/80 dark:bg-slate-900/70 p-8 text-center shadow-2xl backdrop-blur-2xl">
        <div className="text-5xl">{emoji}</div>
        <h2
          id="game-result-title"
          className={cn(
            "mt-4 text-2xl font-black",
            winner === "X" ? "text-cyan-500" : winner === "O" ? "text-fuchsia-500" : "text-slate-700 dark:text-slate-100"
          )}
        >
          {title}
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        <Button ref={buttonRef} variant="primary" className="mt-6 w-full" onClick={onPlayAgain}>
          Play Again
        </Button>
      </div>
    </div>
  );
}
