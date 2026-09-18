import { get, onValue, ref, runTransaction, set } from "firebase/database";
import type { BoardSize, Cell, Player, RoomState, Scores } from "@/types/game";
import { checkDraw, checkWinner, createEmptyBoard } from "./game";
import { getRoomsDb } from "./firebase";

const ROOM_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const DEFAULT_SCORES: Scores = { X: 0, O: 0, draws: 0 };
const VALID_BOARD_SIZES: BoardSize[] = [3, 5, 10];

function generateRoomCode(length = 6): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
  }
  return code;
}

function roomPath(code: string): string {
  return `rooms/${code.toUpperCase()}`;
}

/**
 * Firebase Realtime Database silently deletes any key whose value is `null` —
 * including array entries — which would otherwise corrupt an empty board (an
 * all-null array can come back missing entirely, or with shifted indices).
 * Empty cells are encoded as "" on the wire and decoded back to `null` here.
 */
function encodeBoard(board: Cell[]): Array<Player | ""> {
  return board.map((cell) => (cell === "X" || cell === "O" ? cell : ""));
}

function decodeBoard(raw: unknown, boardSize: BoardSize): Cell[] {
  const length = boardSize * boardSize;
  const source = Array.isArray(raw) ? raw : [];
  return Array.from({ length }, (_, i) => (source[i] === "X" || source[i] === "O" ? (source[i] as Player) : null));
}

/** Defensively rebuilds a well-formed RoomState from whatever Firebase hands back. */
function normalizeRoom(raw: unknown): RoomState | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const boardSize = (VALID_BOARD_SIZES.includes(r.boardSize as BoardSize) ? r.boardSize : 3) as BoardSize;
  const players = (r.players as Record<string, unknown>) ?? {};
  const scores = (r.scores as Record<string, unknown>) ?? {};

  return {
    boardSize,
    board: decodeBoard(r.board, boardSize),
    currentPlayer: r.currentPlayer === "O" ? "O" : "X",
    winner: r.winner === "X" || r.winner === "O" ? (r.winner as Player) : null,
    winningCells: Array.isArray(r.winningCells) ? (r.winningCells as number[]) : [],
    isDraw: Boolean(r.isDraw),
    scores: {
      X: typeof scores.X === "number" ? scores.X : 0,
      O: typeof scores.O === "number" ? scores.O : 0,
      draws: typeof scores.draws === "number" ? scores.draws : 0,
    },
    players: {
      X: typeof players.X === "string" ? players.X : null,
      O: typeof players.O === "string" ? players.O : null,
    },
    createdAt: typeof r.createdAt === "number" ? r.createdAt : 0,
    updatedAt: typeof r.updatedAt === "number" ? r.updatedAt : 0,
  };
}

function toWire(room: RoomState): object {
  return { ...room, board: encodeBoard(room.board) };
}

export async function createRoom(boardSize: BoardSize, clientId: string): Promise<string> {
  const db = getRoomsDb();

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateRoomCode();
    const roomRef = ref(db, roomPath(code));
    const existing = await get(roomRef);
    if (existing.exists()) continue;

    const now = Date.now();
    const room: RoomState = {
      boardSize,
      board: createEmptyBoard(boardSize),
      currentPlayer: "X",
      winner: null,
      winningCells: [],
      isDraw: false,
      scores: DEFAULT_SCORES,
      players: { X: clientId, O: null },
      createdAt: now,
      updatedAt: now,
    };
    await set(roomRef, toWire(room));
    return code;
  }

  throw new Error("Could not allocate a room code. Please try again.");
}

/** Claims a free player slot for this client, or reconnects them to their existing slot. */
export async function joinRoom(code: string, clientId: string): Promise<Player | null> {
  const db = getRoomsDb();
  const roomRef = ref(db, roomPath(code));

  // A transaction's first callback invocation uses whatever value the SDK already
  // has cached locally for this path — for a client that has never touched this
  // room before, that's `null`, even if the room exists on the server. Priming
  // the cache with an explicit read first avoids the transaction reading that
  // false "doesn't exist" and aborting before it ever consults the server.
  const initial = await get(roomRef);
  if (!initial.exists()) return null;

  await runTransaction(roomRef, (raw) => {
    const room = normalizeRoom(raw);
    if (!room) return undefined;
    if (room.players.X === clientId || room.players.O === clientId) return undefined;

    if (!room.players.X) {
      room.players.X = clientId;
    } else if (!room.players.O) {
      room.players.O = clientId;
    } else {
      return undefined;
    }
    room.updatedAt = Date.now();
    return toWire(room);
  });

  const snapshot = await get(roomRef);
  const room = normalizeRoom(snapshot.exists() ? snapshot.val() : null);
  if (!room) return null;
  if (room.players.X === clientId) return "X";
  if (room.players.O === clientId) return "O";
  return null;
}

export function subscribeRoom(code: string, callback: (room: RoomState | null) => void): () => void {
  const db = getRoomsDb();
  const roomRef = ref(db, roomPath(code));
  return onValue(
    roomRef,
    (snapshot) => callback(normalizeRoom(snapshot.exists() ? snapshot.val() : null)),
    () => callback(null)
  );
}

export async function makeOnlineMove(code: string, index: number, clientId: string): Promise<void> {
  const db = getRoomsDb();
  const roomRef = ref(db, roomPath(code));

  await runTransaction(roomRef, (raw) => {
    const room = normalizeRoom(raw);
    if (!room) return undefined;
    if (room.winner || room.isDraw) return undefined;
    const symbol = room.currentPlayer;
    if (room.players[symbol] !== clientId) return undefined;
    if (room.board[index] !== null) return undefined;

    const nextBoard = room.board.slice();
    nextBoard[index] = symbol;
    const result = checkWinner(nextBoard, room.boardSize);
    const draw = !result && checkDraw(nextBoard);

    const nextRoom: RoomState = {
      ...room,
      board: nextBoard,
      currentPlayer: symbol === "X" ? "O" : "X",
      winner: result ? result.winner : null,
      winningCells: result ? result.winningCells : [],
      isDraw: draw,
      scores: result
        ? { ...room.scores, [result.winner]: room.scores[result.winner] + 1 }
        : draw
          ? { ...room.scores, draws: room.scores.draws + 1 }
          : room.scores,
      updatedAt: Date.now(),
    };
    return toWire(nextRoom);
  });
}

export async function resetRound(code: string): Promise<void> {
  const db = getRoomsDb();
  const roomRef = ref(db, roomPath(code));
  await runTransaction(roomRef, (raw) => {
    const room = normalizeRoom(raw);
    if (!room) return undefined;
    const nextRoom: RoomState = {
      ...room,
      board: createEmptyBoard(room.boardSize),
      currentPlayer: "X",
      winner: null,
      winningCells: [],
      isDraw: false,
      updatedAt: Date.now(),
    };
    return toWire(nextRoom);
  });
}

export async function changeOnlineBoardSize(code: string, boardSize: BoardSize): Promise<void> {
  const db = getRoomsDb();
  const roomRef = ref(db, roomPath(code));
  await runTransaction(roomRef, (raw) => {
    const room = normalizeRoom(raw);
    if (!room) return undefined;
    const nextRoom: RoomState = {
      ...room,
      boardSize,
      board: createEmptyBoard(boardSize),
      currentPlayer: "X",
      winner: null,
      winningCells: [],
      isDraw: false,
      updatedAt: Date.now(),
    };
    return toWire(nextRoom);
  });
}

export async function resetOnlineScores(code: string): Promise<void> {
  const db = getRoomsDb();
  const roomRef = ref(db, roomPath(code));
  await runTransaction(roomRef, (raw) => {
    const room = normalizeRoom(raw);
    if (!room) return undefined;
    const nextRoom: RoomState = { ...room, scores: DEFAULT_SCORES, updatedAt: Date.now() };
    return toWire(nextRoom);
  });
}
