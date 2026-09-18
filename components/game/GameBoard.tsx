"use client";

import { GameCell } from "./GameCell";
import { getCellValue } from "@/lib/game";
import type { Coord, Player, SmallBoardSize, SparseBoard } from "@/types/game";

interface GameBoardProps {
  board: SparseBoard;
  boardSize: SmallBoardSize;
  onCellClick: (coord: Coord) => void;
  winner: Player | null;
  winningCells: Coord[];
  isDraw: boolean;
}

export function GameBoard({ board, boardSize, onCellClick, winner, winningCells, isDraw }: GameBoardProps) {
  const gap = boardSize === 10 ? "gap-1 sm:gap-1.5" : boardSize === 5 ? "gap-1.5 sm:gap-2" : "gap-2 sm:gap-3";
  const isGameOver = Boolean(winner) || isDraw;

  const cells: Coord[] = [];
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      cells.push({ row, col });
    }
  }

  return (
    <div className="relative mx-auto w-full max-w-[min(92vw,32rem)] sm:max-w-md">
      <div
        aria-hidden
        className="absolute -inset-3 rounded-[28px] bg-gradient-to-br from-cyan-500/10 via-transparent to-fuchsia-500/10 blur-2xl"
      />
      <div
        className={`relative grid aspect-square w-full rounded-2xl border border-slate-900/10 dark:border-white/10 bg-white/40 dark:bg-white/[0.04] p-2 sm:p-3 shadow-2xl shadow-slate-900/10 dark:shadow-black/40 backdrop-blur-2xl ${gap}`}
        style={{
          gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${boardSize}, minmax(0, 1fr))`,
        }}
      >
        {cells.map(({ row, col }) => {
          const value = getCellValue(board, row, col);
          const isWinning = winningCells.some((c) => c.row === row && c.col === col);
          const isDimmed = isGameOver && winningCells.length > 0 && !isWinning;
          return (
            <GameCell
              key={`${row}-${col}`}
              value={value}
              row={row}
              col={col}
              boardSize={boardSize}
              onClick={() => onCellClick({ row, col })}
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
