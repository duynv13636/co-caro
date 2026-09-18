"use client";

import type { BoardSize } from "@/types/game";
import { cn } from "@/lib/utils";

const OPTIONS: Array<{ size: BoardSize; label: string; ariaLabel?: string }> = [
  { size: 3, label: "3×3" },
  { size: 5, label: "5×5" },
  { size: 10, label: "10×10" },
  { size: 1000, label: "1000×1000", ariaLabel: "1000 by 1000 board" },
  { size: "infinite", label: "∞", ariaLabel: "Infinite board" },
];

interface BoardSizeSelectorProps {
  value: BoardSize;
  onChange: (size: BoardSize) => void;
  /** Restricts which sizes are offered, e.g. online rooms don't support huge/infinite boards. Defaults to all. */
  sizes?: BoardSize[];
}

export function BoardSizeSelector({ value, onChange, sizes }: BoardSizeSelectorProps) {
  const options = sizes ? OPTIONS.filter((option) => sizes.includes(option.size)) : OPTIONS;
  return (
    <div
      role="group"
      aria-label="Board size"
      className="inline-flex gap-1 rounded-2xl border border-slate-900/10 dark:border-white/10 bg-white/50 dark:bg-white/5 p-1 backdrop-blur-xl shadow-inner"
    >
      {options.map((option) => {
        const active = option.size === value;
        return (
          <button
            key={option.size}
            type="button"
            aria-pressed={active}
            aria-label={option.ariaLabel}
            onClick={() => onChange(option.size)}
            className={cn(
              "relative rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400",
              active
                ? "text-white bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-blue-500/40"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/10"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
