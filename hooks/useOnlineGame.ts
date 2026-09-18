"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { BoardSize, Player, RoomState } from "@/types/game";
import { getClientId } from "@/lib/clientId";
import { isFirebaseConfigured } from "@/lib/firebase";
import {
  changeOnlineBoardSize,
  joinRoom,
  makeOnlineMove,
  resetOnlineScores,
  resetRound,
  subscribeRoom,
} from "@/lib/room";

export type RoomStatus = "not-configured" | "connecting" | "joining" | "full" | "not-found" | "ready";

export function useOnlineGame(code: string) {
  const clientId = useMemo(() => getClientId(), []);
  const configured = useMemo(() => isFirebaseConfigured(), []);

  // `undefined` = not loaded yet, `null` = loaded and the room doesn't exist.
  const [room, setRoom] = useState<RoomState | null | undefined>(undefined);
  const [mySymbol, setMySymbol] = useState<Player | null>(null);
  const [joinResolved, setJoinResolved] = useState(false);

  useEffect(() => {
    if (!configured || !code) return;
    let cancelled = false;

    joinRoom(code, clientId).then((symbol) => {
      if (cancelled) return;
      setMySymbol(symbol);
      setJoinResolved(true);
    });

    const unsubscribe = subscribeRoom(code, (nextRoom) => {
      if (cancelled) return;
      setRoom(nextRoom);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [code, clientId, configured]);

  const status: RoomStatus = !configured
    ? "not-configured"
    : room === undefined
      ? "connecting"
      : room === null
        ? "not-found"
        : !joinResolved
          ? "joining"
          : !mySymbol
            ? "full"
            : "ready";

  const makeMove = useCallback(
    (index: number) => {
      if (!code) return;
      void makeOnlineMove(code, index, clientId);
    },
    [code, clientId]
  );

  const resetGame = useCallback(() => {
    if (!code) return;
    void resetRound(code);
  }, [code]);

  const changeBoardSize = useCallback(
    (size: BoardSize) => {
      if (!code) return;
      void changeOnlineBoardSize(code, size);
    },
    [code]
  );

  const resetScores = useCallback(() => {
    if (!code) return;
    void resetOnlineScores(code);
  }, [code]);

  const opponentConnected = Boolean(room?.players.X && room?.players.O);
  const isMyTurn = Boolean(room && mySymbol && room.currentPlayer === mySymbol);

  return {
    room: room ?? null,
    status,
    mySymbol,
    opponentConnected,
    isMyTurn,
    makeMove,
    resetGame,
    changeBoardSize,
    resetScores,
  };
}
