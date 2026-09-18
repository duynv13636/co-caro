import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Player } from "@/types/game";

interface GameStatusProps {
  currentPlayer: Player;
  winner: Player | null;
  isDraw: boolean;
}

export function GameStatus({ currentPlayer, winner, isDraw }: GameStatusProps) {
  let content: ReactNode;

  if (winner) {
    content = (
      <span
        className={cn(
          "bg-clip-text text-transparent bg-gradient-to-r",
          winner === "X" ? "from-cyan-400 to-blue-500" : "from-fuchsia-500 to-pink-500"
        )}
      >
        🎉 Player {winner} Wins!
      </span>
    );
  } else if (isDraw) {
    content = <span className="text-slate-500 dark:text-slate-300">🤝 Draw Game</span>;
  } else {
    content = (
      <>
        <span className="block text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Your Turn
        </span>
        <span
          className={cn(
            "font-black",
            currentPlayer === "X" ? "text-cyan-500 dark:text-cyan-400" : "text-fuchsia-500 dark:text-fuchsia-400"
          )}
        >
          Player {currentPlayer}
        </span>
      </>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="animate-fade-in text-center text-lg sm:text-xl font-bold tracking-tight"
    >
      {content}
    </div>
  );
}
