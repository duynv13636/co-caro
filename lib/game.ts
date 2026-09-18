import type { BoardSize, Cell, Player, WinResult } from "@/types/game";

const WIN_LENGTHS: Record<BoardSize, number> = {
  3: 3,
  5: 4,
  10: 5,
};

const DIRECTIONS: Array<[number, number]> = [
  [0, 1], // horizontal
  [1, 0], // vertical
  [1, 1], // diagonal
  [1, -1], // anti-diagonal
];

export function getWinLength(boardSize: BoardSize): number {
  return WIN_LENGTHS[boardSize];
}

export function createEmptyBoard(boardSize: BoardSize): Cell[] {
  return Array<Cell>(boardSize * boardSize).fill(null);
}

export function makeMove(board: Cell[], index: number, player: Player): Cell[] {
  if (board[index] !== null) return board;
  const next = board.slice();
  next[index] = player;
  return next;
}

export function checkWinner(
  board: Cell[],
  boardSize: BoardSize,
  winLength: number = getWinLength(boardSize)
): WinResult | null {
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const index = row * boardSize + col;
      const player = board[index];
      if (!player) continue;

      for (const [dRow, dCol] of DIRECTIONS) {
        const cells: number[] = [index];
        for (let step = 1; step < winLength; step++) {
          const r = row + dRow * step;
          const c = col + dCol * step;
          if (r < 0 || r >= boardSize || c < 0 || c >= boardSize) break;
          const idx = r * boardSize + c;
          if (board[idx] !== player) break;
          cells.push(idx);
        }
        if (cells.length >= winLength) {
          return { winner: player, winningCells: cells };
        }
      }
    }
  }
  return null;
}

export function checkDraw(board: Cell[]): boolean {
  return board.every((cell) => cell !== null);
}

export function getWinningCells(result: WinResult | null): number[] {
  return result?.winningCells ?? [];
}
