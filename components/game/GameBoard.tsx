"use client";

import { GameCell } from "./GameCell";
import type { BoardSize, Cell, Player } from "@/types/game";

interface GameBoardProps {
  board: Cell[];
  boardSize: BoardSize;
  onCellClick: (index: number) => void;
  winner: Player | null;
  winningCells: number[];
  isDraw: boolean;
}

export function GameBoard({ board, boardSize, onCellClick, winner, winningCells, isDraw }: GameBoardProps) {
  const gap = boardSize === 10 ? "gap-1 sm:gap-1.5" : boardSize === 5 ? "gap-1.5 sm:gap-2" : "gap-2 sm:gap-3";
  const isGameOver = Boolean(winner) || isDraw;

  return (
    <div className="relative mx-auto w-full max-w-[min(92vw,32rem)] sm:max-w-md">
      <div
        aria-hidden
        className="absolute -inset-3 rounded-[28px] bg-gradient-to-br from-cyan-500/10 via-transparent to-fuchsia-500/10 blur-2xl"
      />
      <div
        className={`relative grid aspect-square w-full rounded-2xl border border-slate-900/10 dark:border-white/10 bg-white/40 dark:bg-white/[0.04] p-2 sm:p-3 shadow-2xl shadow-slate-900/10 dark:shadow-black/40 backdrop-blur-2xl ${gap}`}
        style={{ gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))` }}
      >
        {board.map((value, index) => {
          const row = Math.floor(index / boardSize);
          const col = index % boardSize;
          const isWinning = winningCells.includes(index);
          const isDimmed = isGameOver && winningCells.length > 0 && !isWinning;
          return (
            <GameCell
              key={index}
              value={value}
              row={row}
              col={col}
              boardSize={boardSize}
              onClick={() => onCellClick(index)}
              disabled={isGameOver}
              isWinning={isWinning}
              isDimmed={isDimmed}
            />
          );
        })}
      </div>
    </div>
  );
}
