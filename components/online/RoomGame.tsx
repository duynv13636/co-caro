"use client";

import { useState } from "react";
import Link from "next/link";
import { Home, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";
import { useOnlineGame } from "@/hooks/useOnlineGame";
import { getCellValue } from "@/lib/game";
import type { Coord } from "@/types/game";
import { useGameEndEffects } from "@/hooks/useGameEndEffects";
import { useTheme } from "@/hooks/useTheme";
import { useSound } from "@/hooks/useSound";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SoundToggle } from "@/components/ui/SoundToggle";
import { Button } from "@/components/ui/Button";
import { BoardSizeSelector } from "@/components/game/BoardSizeSelector";
import { PlayerCard } from "@/components/game/PlayerCard";
import { ScoreBoard } from "@/components/game/ScoreBoard";
import { GameStatus } from "@/components/game/GameStatus";
import { GameBoard } from "@/components/game/GameBoard";
import { GameResultModal } from "@/components/game/GameResultModal";
import { RoomShareCard } from "./RoomShareCard";

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

function HeaderBar({
  theme,
  soundEnabled,
  onToggleTheme,
  onToggleSound,
}: {
  theme: "dark" | "light";
  soundEnabled: boolean;
  onToggleTheme: () => void;
  onToggleSound: () => void;
}) {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-fuchsia-500 text-lg font-black text-white shadow-lg shadow-blue-500/30">
          XO
        </span>
        <span className="text-lg font-black tracking-tight text-slate-800 dark:text-white">
          CARO <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">OX</span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-2xl border border-slate-900/10 dark:border-white/10 bg-white/60 dark:bg-white/5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-100 backdrop-blur-xl transition-colors hover:bg-white/80 dark:hover:bg-white/10"
        >
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">Home</span>
        </Link>
        <SoundToggle enabled={soundEnabled} onToggle={onToggleSound} />
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
    </header>
  );
}

function InfoScreen({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-2xl font-black">{title}</h1>
      <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
      <Link href="/online">
        <Button variant="primary">Back to Lobby</Button>
      </Link>
    </div>
  );
}

interface RoomGameProps {
  code: string;
}

export function RoomGame({ code }: RoomGameProps) {
  const { theme, toggleTheme } = useTheme();
  const { enabled: soundEnabled, toggleSound, playMove, playWin, playDraw, playButton } = useSound();
  const [modalOpen, setModalOpen] = useState(false);

  const { room, status, mySymbol, opponentConnected, isMyTurn, makeMove, resetGame, changeBoardSize, resetScores } =
    useOnlineGame(code);

  useGameEndEffects(room?.winner ?? null, room?.isDraw ?? false, {
    onWin: (winner) => {
      if (winner === mySymbol) {
        playWin();
        fireConfetti();
      }
      setModalOpen(true);
    },
    onDraw: () => {
      playDraw();
      setModalOpen(true);
    },
  });

  const handleThemeToggle = () => {
    playButton();
    toggleTheme();
  };

  if (status === "not-configured") {
    return (
      <div className="relative z-0 mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-4 py-6 sm:px-6 sm:py-10">
        <HeaderBar theme={theme} soundEnabled={soundEnabled} onToggleTheme={handleThemeToggle} onToggleSound={toggleSound} />
        <InfoScreen
          title="Online mode isn't set up yet"
          description="Add your Firebase config to .env.local (see README) to enable online play."
        />
      </div>
    );
  }

  if (status === "connecting" || status === "joining") {
    return (
      <div className="relative z-0 mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-4 py-6 sm:px-6 sm:py-10">
        <HeaderBar theme={theme} soundEnabled={soundEnabled} onToggleTheme={handleThemeToggle} onToggleSound={toggleSound} />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm">Connecting to room {code}…</p>
        </div>
      </div>
    );
  }

  if (status === "not-found") {
    return (
      <div className="relative z-0 mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-4 py-6 sm:px-6 sm:py-10">
        <HeaderBar theme={theme} soundEnabled={soundEnabled} onToggleTheme={handleThemeToggle} onToggleSound={toggleSound} />
        <InfoScreen title="Room not found" description={`No room matches code "${code}". Check the link or code and try again.`} />
      </div>
    );
  }

  if (status === "full" || !room) {
    return (
      <div className="relative z-0 mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-4 py-6 sm:px-6 sm:py-10">
        <HeaderBar theme={theme} soundEnabled={soundEnabled} onToggleTheme={handleThemeToggle} onToggleSound={toggleSound} />
        <InfoScreen title="Room is full" description="This room already has two players. Create a new room to start your own game." />
      </div>
    );
  }

  const { board, boardSize, currentPlayer, winner, winningCells, isDraw, scores } = room;
  const boardDisabled = Boolean(winner) || isDraw || !opponentConnected || !isMyTurn;

  const handleCellClick = (coord: Coord) => {
    if (getCellValue(board, coord.row, coord.col) || boardDisabled) return;
    playMove(currentPlayer);
    makeMove(coord);
  };

  const handleNewGame = () => {
    playButton();
    setModalOpen(false);
    resetGame();
  };

  const handleBoardSizeChange = (size: typeof boardSize) => {
    playButton();
    setModalOpen(false);
    changeBoardSize(size);
  };

  const handleResetScore = () => {
    playButton();
    resetScores();
  };

  return (
    <div className="relative z-0 mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-4 py-6 sm:px-6 sm:py-10">
      <HeaderBar theme={theme} soundEnabled={soundEnabled} onToggleTheme={handleThemeToggle} onToggleSound={toggleSound} />

      <section className="mt-6 text-center">
        <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500">
            CARO OX
          </span>
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
          {mySymbol ? `You are Player ${mySymbol}` : "Spectating"} · Room {code}
        </p>
      </section>

      {!opponentConnected ? (
        <div className="mt-8">
          <RoomShareCard code={code} />
        </div>
      ) : null}

      <div className="mt-6 flex justify-center">
        <BoardSizeSelector value={boardSize} onChange={handleBoardSizeChange} sizes={[3, 5, 10]} />
      </div>

      <div className="mt-6">
        <ScoreBoard scores={scores} />
      </div>

      <div className="mt-6 flex items-stretch gap-3 sm:gap-4">
        <PlayerCard player="X" score={scores.X} active={!winner && !isDraw && currentPlayer === "X"} label={mySymbol === "X" ? "You" : "Player X"} />
        <div className="flex items-center px-1 text-xs font-bold text-slate-400 dark:text-slate-500">VS</div>
        <PlayerCard player="O" score={scores.O} active={!winner && !isDraw && currentPlayer === "O"} label={mySymbol === "O" ? "You" : "Player O"} />
      </div>

      <div className="mt-8">
        {boardSize === 3 || boardSize === 5 || boardSize === 10 ? (
          <GameBoard
            board={board}
            boardSize={boardSize}
            onCellClick={handleCellClick}
            winner={winner}
            winningCells={winningCells}
            isDraw={isDraw}
          />
        ) : null}
      </div>

      <div className="mt-6">
        {opponentConnected ? (
          <GameStatus currentPlayer={currentPlayer} winner={winner} isDraw={isDraw} />
        ) : (
          <p className="text-center text-sm font-medium text-slate-500 dark:text-slate-400">
            Waiting for opponent to join…
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button variant="primary" onClick={handleNewGame} className="w-full sm:w-auto sm:min-w-[180px]">
          New Game
        </Button>
        <Button variant="secondary" onClick={handleResetScore} className="w-full sm:w-auto sm:min-w-[180px]">
          Reset Score
        </Button>
      </div>

      <GameResultModal open={modalOpen} winner={winner} isDraw={isDraw} onPlayAgain={handleNewGame} mySymbol={mySymbol} />
    </div>
  );
}
