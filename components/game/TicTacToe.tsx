"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Globe } from "lucide-react";
import confetti from "canvas-confetti";
import type { BoardSize } from "@/types/game";
import { useGame } from "@/hooks/useGame";
import { useGameEndEffects } from "@/hooks/useGameEndEffects";
import { useTheme } from "@/hooks/useTheme";
import { useSound } from "@/hooks/useSound";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SoundToggle } from "@/components/ui/SoundToggle";
import { Button } from "@/components/ui/Button";
import { BoardSizeSelector } from "./BoardSizeSelector";
import { PlayerCard } from "./PlayerCard";
import { ScoreBoard } from "./ScoreBoard";
import { GameStatus } from "./GameStatus";
import { GameBoard } from "./GameBoard";
import { GameResultModal } from "./GameResultModal";

function fireConfetti() {
  try {
    const duration = 2500;
    const end = Date.now() + duration;
    const colors = ["#22D3EE", "#3B82F6", "#A855F7", "#EC4899", "#22C55E"];

    (function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors });
      confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  } catch {
    // confetti failure must not crash the game
  }
}

export function TicTacToe() {
  const { theme, toggleTheme } = useTheme();
  const { enabled: soundEnabled, toggleSound, playMove, playWin, playDraw, playButton } = useSound();
  const [modalOpen, setModalOpen] = useState(false);

  const {
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
  } = useGame();

  useGameEndEffects(winner, isDraw, {
    onWin: () => {
      playWin();
      fireConfetti();
    },
    onDraw: () => playDraw(),
  });

  useEffect(() => {
    if (!winner && !isDraw) return;
    const timer = setTimeout(() => setModalOpen(true), 700);
    return () => clearTimeout(timer);
  }, [winner, isDraw]);

  const handleCellClick = (index: number) => {
    if (board[index] || winner || isDraw) return;
    playMove(currentPlayer);
    makeMove(index);
  };

  const handleNewGame = () => {
    playButton();
    setModalOpen(false);
    resetGame();
  };

  const handleBoardSizeChange = (size: BoardSize) => {
    playButton();
    setModalOpen(false);
    changeBoardSize(size);
  };

  const handleResetScore = () => {
    playButton();
    resetScores();
  };

  const handleThemeToggle = () => {
    playButton();
    toggleTheme();
  };

  return (
    <div className="relative z-0 mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-4 py-6 sm:px-6 sm:py-10">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-fuchsia-500 text-lg font-black text-white shadow-lg shadow-blue-500/30">
            XO
          </span>
          <span className="text-lg font-black tracking-tight text-slate-800 dark:text-white">
            CARO{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">
              OX
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/online"
            className="flex items-center gap-1.5 rounded-2xl border border-slate-900/10 dark:border-white/10 bg-white/60 dark:bg-white/5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-100 backdrop-blur-xl transition-colors hover:bg-white/80 dark:hover:bg-white/10"
          >
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Play Online</span>
          </Link>
          <SoundToggle enabled={soundEnabled} onToggle={toggleSound} />
          <ThemeToggle theme={theme} onToggle={handleThemeToggle} />
        </div>
      </header>

      <section className="mt-8 text-center sm:mt-12">
        <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500">
            CARO OX
          </span>
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400 sm:text-base">
          Classic game. Premium experience.
        </p>
      </section>

      <div className="mt-8 flex justify-center">
        <BoardSizeSelector value={boardSize} onChange={handleBoardSizeChange} />
      </div>

      <div className="mt-6">
        <ScoreBoard scores={scores} />
      </div>

      <div className="mt-6 flex items-stretch gap-3 sm:gap-4">
        <PlayerCard player="X" score={scores.X} active={!winner && !isDraw && currentPlayer === "X"} label="Player 1" />
        <div className="flex items-center px-1 text-xs font-bold text-slate-400 dark:text-slate-500">VS</div>
        <PlayerCard player="O" score={scores.O} active={!winner && !isDraw && currentPlayer === "O"} label="Player 2" />
      </div>

      <div className="mt-8">
        <GameBoard
          board={board}
          boardSize={boardSize}
          onCellClick={handleCellClick}
          winner={winner}
          winningCells={winningCells}
          isDraw={isDraw}
        />
      </div>

      <div className="mt-6">
        <GameStatus currentPlayer={currentPlayer} winner={winner} isDraw={isDraw} />
      </div>

      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button variant="primary" onClick={handleNewGame} className="w-full sm:w-auto sm:min-w-[180px]">
          New Game
        </Button>
        <Button variant="secondary" onClick={handleResetScore} className="w-full sm:w-auto sm:min-w-[180px]">
          Reset Score
        </Button>
      </div>

      <GameResultModal open={modalOpen} winner={winner} isDraw={isDraw} onPlayAgain={handleNewGame} />
    </div>
  );
}
