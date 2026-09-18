import type { BoardSize, Coord, FixedBoardSize, Player, SparseBoard, WinResult } from "@/types/game";

const WIN_LENGTHS: Record<FixedBoardSize, number> = {
  3: 3,
  5: 4,
  10: 5,
  1000: 5,
};

const INFINITE_WIN_LENGTH = 5;

const DIRECTIONS: Array<[number, number]> = [
  [0, 1], // horizontal
  [1, 0], // vertical
  [1, 1], // diagonal
  [1, -1], // anti-diagonal
];

export function getWinLength(boardSize: BoardSize): number {
  return boardSize === "infinite" ? INFINITE_WIN_LENGTH : WIN_LENGTHS[boardSize];
}

export function cellKey(row: number, col: number): string {
  return `${row},${col}`;
}

export function getCellValue(board: SparseBoard, row: number, col: number): Player | null {
  return board[cellKey(row, col)] ?? null;
}

export function createEmptyBoard(): SparseBoard {
  return {};
}

export function placeMove(board: SparseBoard, coord: Coord, player: Player): SparseBoard {
  const key = cellKey(coord.row, coord.col);
  if (board[key]) return board;
  return { ...board, [key]: player };
}

/**
 * A move can only ever create a new winning line through the cell it was just
 * placed on, so checking outward from that one cell (instead of scanning the
 * whole board) is both simpler and the only approach that works for a board
 * with no fixed bounds.
 */
export function checkWinnerFromMove(board: SparseBoard, lastMove: Coord, boardSize: BoardSize): WinResult | null {
  const player = getCellValue(board, lastMove.row, lastMove.col);
  if (!player) return null;

  const winLength = getWinLength(boardSize);
  const inBounds = (row: number, col: number) =>
    boardSize === "infinite" || (row >= 0 && row < boardSize && col >= 0 && col < boardSize);

  for (const [dRow, dCol] of DIRECTIONS) {
    const line: Coord[] = [lastMove];

    for (let step = 1; step < winLength; step++) {
      const row = lastMove.row + dRow * step;
      const col = lastMove.col + dCol * step;
      if (!inBounds(row, col) || getCellValue(board, row, col) !== player) break;
      line.push({ row, col });
    }
    for (let step = 1; step < winLength; step++) {
      const row = lastMove.row - dRow * step;
      const col = lastMove.col - dCol * step;
      if (!inBounds(row, col) || getCellValue(board, row, col) !== player) break;
      line.unshift({ row, col });
    }

    if (line.length >= winLength) {
      return { winner: player, winningCells: line };
    }
  }
  return null;
}

export function checkDraw(board: SparseBoard, boardSize: BoardSize): boolean {
  if (boardSize === "infinite") return false;
  return Object.keys(board).length >= boardSize * boardSize;
}
