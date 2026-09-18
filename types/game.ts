export type Player = "X" | "O";

export type Cell = Player | null;

export type BoardSize = 3 | 5 | 10;

export type WinningCell = number;

export interface Scores {
  X: number;
  O: number;
  draws: number;
}

export interface WinResult {
  winner: Player;
  winningCells: WinningCell[];
}

export type Theme = "dark" | "light";

export interface RoomPlayers {
  X: string | null;
  O: string | null;
}

export interface RoomState {
  boardSize: BoardSize;
  board: Cell[];
  currentPlayer: Player;
  winner: Player | null;
  winningCells: WinningCell[];
  isDraw: boolean;
  scores: Scores;
  players: RoomPlayers;
  createdAt: number;
  updatedAt: number;
}
