"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Home, Loader2 } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useSound } from "@/hooks/useSound";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SoundToggle } from "@/components/ui/SoundToggle";
import { Button } from "@/components/ui/Button";
import { getClientId } from "@/lib/clientId";
import { isFirebaseConfigured } from "@/lib/firebase";
import { createRoom } from "@/lib/room";
import type { BoardSize } from "@/types/game";

export function OnlineLobby() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { enabled: soundEnabled, toggleSound, playButton } = useSound();

  const [boardSize, setBoardSize] = useState<BoardSize>(3);
  const [joinCode, setJoinCode] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const configured = isFirebaseConfigured();

  const handleThemeToggle = () => {
    playButton();
    toggleTheme();
  };

  const handleCreate = async () => {
    setError(null);
    setCreating(true);
    playButton();
    try {
      const clientId = getClientId();
      const code = await createRoom(boardSize, clientId);
      router.push(`/room/${code}`);
    } catch {
      setError("Could not create a room. Please try again.");
      setCreating(false);
    }
  };

  const handleJoin = () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    playButton();
    router.push(`/room/${code}`);
  };

  return (
    <div className="relative z-0 mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 py-6 sm:px-6 sm:py-10">
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
          <SoundToggle enabled={soundEnabled} onToggle={toggleSound} />
          <ThemeToggle theme={theme} onToggle={handleThemeToggle} />
        </div>
      </header>

      <section className="mt-10 text-center sm:mt-14">
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500">
            Play Online
          </span>
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400 sm:text-base">
          Create a room and share the link with a friend
        </p>
      </section>

      {!configured ? (
        <div className="mt-10 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-center text-sm text-amber-700 dark:text-amber-300">
          Online mode isn&apos;t configured yet. Add your Firebase project keys to{" "}
          <code className="rounded bg-black/10 dark:bg-white/10 px-1.5 py-0.5">.env.local</code> (see README) to enable
          it.
        </div>
      ) : (
        <div className="mt-10 flex flex-col gap-6">
          <div className="rounded-2xl border border-slate-900/10 dark:border-white/10 bg-white/50 dark:bg-white/5 p-6 backdrop-blur-xl">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Create a Room
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Choose a board size to start</p>
            <div className="mt-4 inline-flex flex-wrap gap-1 rounded-2xl border border-slate-900/10 dark:border-white/10 bg-white/50 dark:bg-white/5 p-1">
              {([3, 5, 10, 1000] as BoardSize[]).map((size) => (
                <button
                  key={size}
                  type="button"
                  aria-pressed={boardSize === size}
                  onClick={() => setBoardSize(size)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                    boardSize === size
                      ? "text-white bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-blue-500/40"
                      : "text-slate-600 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-white/10"
                  }`}
                >
                  {size}×{size}
                </button>
              ))}
            </div>
            <Button variant="primary" onClick={handleCreate} disabled={creating} className="mt-5 w-full justify-center">
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Create Room
            </Button>
          </div>

          <div className="rounded-2xl border border-slate-900/10 dark:border-white/10 bg-white/50 dark:bg-white/5 p-6 backdrop-blur-xl">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Join a Room
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Enter the room code your friend shared</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                placeholder="ROOM CODE"
                maxLength={8}
                aria-label="Room code"
                className="flex-1 rounded-xl border border-slate-900/10 dark:border-white/10 bg-white/70 dark:bg-black/20 px-4 py-3 text-center text-lg font-black tracking-[0.3em] text-slate-800 dark:text-white placeholder:text-sm placeholder:font-medium placeholder:tracking-normal placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              />
              <Button variant="secondary" onClick={handleJoin} disabled={!joinCode.trim()}>
                Join Room
              </Button>
            </div>
          </div>

          {error ? <p className="text-center text-sm text-red-500">{error}</p> : null}
        </div>
      )}
    </div>
  );
}
