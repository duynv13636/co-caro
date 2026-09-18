"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import type { BoardSize, Coord, Player, Scores, SparseBoard } from "@/types/game";
import { checkDraw, checkWinnerFromMove, createEmptyBoard, getCellValue, placeMove } from "@/lib/game";
import { createPersistedStore } from "@/lib/store";

const DEFAULT_SCORES: Scores = { X: 0, O: 0, draws: 0 };
const DEFAULT_BOARD_SIZE: BoardSize = 3;

const scoresStore = createPersistedStore<Scores>("caro-ox:scores", DEFAULT_SCORES);
const boardSizeStore = createPersistedStore<BoardSize>("caro-ox:boardSize", DEFAULT_BOARD_SIZE);

export function useGame() {
  const boardSize = useSyncExternalStore(
    boardSizeStore.subscribe,
    boardSizeStore.getSnapshot,
    boardSizeStore.getServerSnapshot
  );
  const scores = useSyncExternalStore(scoresStore.subscribe, scoresStore.getSnapshot, scoresStore.getServerSnapshot);

  const [board, setBoard] = useState<SparseBoard>(() => createEmptyBoard());
  const [lastMove, setLastMove] = useState<Coord | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
  const [winner, setWinner] = useState<Player | null>(null);
  const [winningCells, setWinningCells] = useState<Coord[]>([]);
  const [isDraw, setIsDraw] = useState(false);

  // Reset the live round whenever the persisted board size changes — either from
  // the user picking a new size, or from the localStorage value being restored
  // after hydration. Adjusting state during render (not in an effect) is the
  // React-endorsed way to keep this in sync without an extra render pass.
  const [syncedBoardSize, setSyncedBoardSize] = useState(boardSize);
  if (boardSize !== syncedBoardSize) {
    setSyncedBoardSize(boardSize);
    setBoard(createEmptyBoard());
    setLastMove(null);
    setCurrentPlayer("X");
    setWinner(null);
    setWinningCells([]);
    setIsDraw(false);
  }

  const makeMove = useCallback(
    (coord: Coord) => {
      if (winner || isDraw || getCellValue(board, coord.row, coord.col) !== null) return;

      const nextBoard = placeMove(board, coord, currentPlayer);
      const result = checkWinnerFromMove(nextBoard, coord, boardSize);

      setBoard(nextBoard);
      setLastMove(coord);

      if (result) {
        setWinner(result.winner);
        setWinningCells(result.winningCells);
        scoresStore.set((s) => ({ ...s, [result.winner]: s[result.winner] + 1 }));
      } else if (checkDraw(nextBoard, boardSize)) {
        setIsDraw(true);
        scoresStore.set((s) => ({ ...s, draws: s.draws + 1 }));
      } else {
        setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
      }
    },
    [board, winner, isDraw, currentPlayer, boardSize]
  );

  const resetGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setLastMove(null);
    setCurrentPlayer("X");
    setWinner(null);
    setWinningCells([]);
    setIsDraw(false);
  }, []);

  const changeBoardSize = useCallback((size: BoardSize) => {
    boardSizeStore.set(size);
  }, []);

  const resetScores = useCallback(() => {
    scoresStore.set(DEFAULT_SCORES);
  }, []);

  return {
    board,
    boardSize,
    lastMove,
    currentPlayer,
    winner,
    winningCells,
    isDraw,
    scores,
    makeMove,
    resetGame,
    changeBoardSize,
    resetScores,
  };
}
