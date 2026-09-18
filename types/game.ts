export type Player = "X" | "O";

export type Cell = Player | null;

/** Rendered as a plain CSS grid of all cells. */
export type SmallBoardSize = 3 | 5 | 10;

/** Rendered on a panned/zoomed viewport instead — a full grid of cells would be too many DOM nodes. */
export type LargeBoardSize = 1000;

export type FixedBoardSize = SmallBoardSize | LargeBoardSize;

/** "infinite" is an unbounded board — panned/zoomed on a viewport instead of a fixed grid. */
export type BoardSize = FixedBoardSize | "infinite";

export interface Coord {
  row: number;
  col: number;
}

/** Sparse board: only occupied cells are stored, keyed by `${row},${col}`. Works for any board size. */
export type SparseBoard = Record<string, Player>;

export interface Scores {
  X: number;
  O: number;
  draws: number;
}

export interface WinResult {
  winner: Player;
  winningCells: Coord[];
}

export type Theme = "dark" | "light";

export interface RoomPlayers {
  X: string | null;
  O: string | null;
}

export interface RoomState {
  boardSize: BoardSize;
  board: SparseBoard;
  lastMove: Coord | null;
  currentPlayer: Player;
  winner: Player | null;
  winningCells: Coord[];
  isDraw: boolean;
  scores: Scores;
  players: RoomPlayers;
  createdAt: number;
  updatedAt: number;
}
