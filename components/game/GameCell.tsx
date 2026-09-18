"use client";

import { cn } from "@/lib/utils";
import type { Cell, SmallBoardSize } from "@/types/game";

interface GameCellProps {
  value: Cell;
  row: number;
  col: number;
  boardSize: SmallBoardSize;
  onClick: () => void;
  disabled: boolean;
  isWinning: boolean;
  isDimmed: boolean;
}

export function GameCell({ value, row, col, boardSize, onClick, disabled, isWinning, isDimmed }: GameCellProps) {
  const ariaLabel = value
    ? `Cell row ${row + 1} column ${col + 1}, occupied by ${value}`
    : `Cell row ${row + 1} column ${col + 1}, empty`;

  const isSmall = boardSize === 10;
  const isMedium = boardSize === 5;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || value !== null}
      aria-label={ariaLabel}
      className={cn(
        "group relative flex items-center justify-center rounded-lg sm:rounded-xl border transition-all duration-200 ease-out",
        "border-slate-900/10 dark:border-white/10 bg-white/40 dark:bg-white/[0.03]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        !value &&
          !disabled &&
          "hover:bg-white/70 dark:hover:bg-white/[0.08] hover:border-slate-900/20 dark:hover:border-white/20 hover:scale-[1.03] active:scale-[0.97]",
        isWinning &&
          "border-emerald-400/80 bg-emerald-400/10 shadow-[0_0_20px_-2px_rgba(52,211,153,0.6)] animate-win-pulse",
        isDimmed && "opacity-30",
        "disabled:cursor-not-allowed"
      )}
    >
      {value && (
        <span
          className={cn(
            "animate-mark-in select-none font-black leading-none",
            isSmall ? "text-lg sm:text-2xl" : isMedium ? "text-2xl sm:text-4xl" : "text-4xl sm:text-6xl",
            value === "X"
              ? "text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-blue-500 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]"
              : "text-transparent bg-clip-text bg-gradient-to-br from-fuchsia-500 to-pink-500 drop-shadow-[0_0_10px_rgba(217,70,239,0.5)]"
          )}
        >
          {value}
        </span>
      )}
    </button>
  );
}
