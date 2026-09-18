"use client";

import { cn } from "@/lib/utils";
import type { Player } from "@/types/game";

interface PlayerCardProps {
  player: Player;
  score: number;
  active: boolean;
  label: string;
}

export function PlayerCard({ player, score, active, label }: PlayerCardProps) {
  const isX = player === "X";
  return (
    <div
      className={cn(
        "relative flex-1 rounded-2xl border px-4 py-4 sm:px-6 sm:py-5 backdrop-blur-xl transition-all duration-300",
        "bg-white/50 dark:bg-white/5 border-slate-900/10 dark:border-white/10",
        active &&
          (isX
            ? "border-cyan-400/70 shadow-[0_0_30px_-5px_rgba(34,211,238,0.5)]"
            : "border-fuchsia-400/70 shadow-[0_0_30px_-5px_rgba(217,70,239,0.5)]")
      )}
    >
      {active && (
        <span
          aria-hidden
          className={cn(
            "absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full animate-pulse",
            isX ? "bg-cyan-400" : "bg-fuchsia-400"
          )}
        />
      )}
      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-2xl sm:text-3xl font-black bg-clip-text text-transparent",
          isX
            ? "bg-gradient-to-r from-cyan-400 to-blue-500"
            : "bg-gradient-to-r from-fuchsia-500 to-pink-500"
        )}
      >
        {player}
      </p>
      <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
        {String(score).padStart(2, "0")} wins
      </p>
    </div>
  );
}
