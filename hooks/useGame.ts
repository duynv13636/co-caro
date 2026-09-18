"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import type { BoardSize, Cell, Player, Scores } from "@/types/game";
import { checkDraw, checkWinner, createEmptyBoard, makeMove as applyMove } from "@/lib/game";
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

  const [board, setBoard] = useState<Cell[]>(() => createEmptyBoard(DEFAULT_BOARD_SIZE));
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
  const [winner, setWinner] = useState<Player | null>(null);
  const [winningCells, setWinningCells] = useState<number[]>([]);
  const [isDraw, setIsDraw] = useState(false);

  // Reset the live round whenever the persisted board size changes — either from
  // the user picking a new size, or from the localStorage value being restored
  // after hydration. Adjusting state during render (not in an effect) is the
  // React-endorsed way to keep this in sync without an extra render pass.
  const [syncedBoardSize, setSyncedBoardSize] = useState(boardSize);
  if (boardSize !== syncedBoardSize) {
    setSyncedBoardSize(boardSize);
    setBoard(createEmptyBoard(boardSize));
    setCurrentPlayer("X");
    setWinner(null);
    setWinningCells([]);
    setIsDraw(false);
  }

  const makeMove = useCallback(
    (index: number) => {
      if (winner || isDraw || board[index] !== null) return;

      const nextBoard = applyMove(board, index, currentPlayer);
      const result = checkWinner(nextBoard, boardSize);

      setBoard(nextBoard);

      if (result) {
        setWinner(result.winner);
        setWinningCells(result.winningCells);
        scoresStore.set((s) => ({ ...s, [result.winner]: s[result.winner] + 1 }));
      } else if (checkDraw(nextBoard)) {
        setIsDraw(true);
        scoresStore.set((s) => ({ ...s, draws: s.draws + 1 }));
      } else {
        setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
      }
    },
    [board, winner, isDraw, currentPlayer, boardSize]
  );

  const resetGame = useCallback(() => {
    setBoard(createEmptyBoard(boardSize));
    setCurrentPlayer("X");
    setWinner(null);
    setWinningCells([]);
    setIsDraw(false);
  }, [boardSize]);

  const changeBoardSize = useCallback((size: BoardSize) => {
    boardSizeStore.set(size);
  }, []);

  const resetScores = useCallback(() => {
    scoresStore.set(DEFAULT_SCORES);
  }, []);

  return {
    board,
    boardSize,
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
