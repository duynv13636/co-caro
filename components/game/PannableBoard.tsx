"use client";

import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent } from "react";
import { LocateFixed, Minus, Plus } from "lucide-react";
import { getCellValue } from "@/lib/game";
import { cn } from "@/lib/utils";
import type { BoardSize, Coord, Player, SparseBoard } from "@/types/game";

interface PannableBoardProps {
  board: SparseBoard;
  boardSize: Exclude<BoardSize, 3 | 5 | 10>;
  onCellClick: (coord: Coord) => void;
  winner: Player | null;
  winningCells: Coord[];
  lastMove: Coord | null;
  disabled: boolean;
}

const ZOOM_LEVELS = [36, 48, 64, 80];
const DEFAULT_ZOOM_INDEX = 2;
const DRAG_THRESHOLD = 6;
const CELL_GAP = 4;
const BUFFER_CELLS = 2;

interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  startCenterRow: number;
  startCenterCol: number;
  moved: boolean;
}

export function PannableBoard({ board, boardSize, onCellClick, winner, winningCells, lastMove, disabled }: PannableBoardProps) {
  // A fixed-size board still can't render all its cells as DOM nodes (1000x1000
  // would be a million buttons), so it reuses this same panned/zoomed viewport,
  // just clamped to its bounds instead of scrolling forever.
  const bounds = boardSize === "infinite" ? null : boardSize;
  const defaultCenter = bounds ? { row: Math.floor(bounds / 2), col: Math.floor(bounds / 2) } : { row: 0, col: 0 };
  const clampAxis = (v: number) => (bounds ? Math.min(bounds - 1, Math.max(0, v)) : v);

  const containerRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX);
  const [center, setCenter] = useState<{ row: number; col: number }>(defaultCenter);
  const [isDragging, setIsDragging] = useState(false);

  const dragRef = useRef<DragState | null>(null);
  const cellSize = ZOOM_LEVELS[zoomIndex];

  const measuredRef = (node: HTMLDivElement | null) => {
    containerRef.current = node;
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setViewport({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(node);
  };

  const visibleCells = useMemo(() => {
    if (viewport.width === 0 || viewport.height === 0) return [];
    const halfCols = viewport.width / 2 / cellSize;
    const halfRows = viewport.height / 2 / cellSize;
    let startCol = Math.floor(center.col - halfCols) - BUFFER_CELLS;
    let endCol = Math.ceil(center.col + halfCols) + BUFFER_CELLS;
    let startRow = Math.floor(center.row - halfRows) - BUFFER_CELLS;
    let endRow = Math.ceil(center.row + halfRows) + BUFFER_CELLS;

    if (bounds) {
      startCol = Math.max(0, startCol);
      endCol = Math.min(bounds - 1, endCol);
      startRow = Math.max(0, startRow);
      endRow = Math.min(bounds - 1, endRow);
    }

    const cells: Coord[] = [];
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        cells.push({ row, col });
      }
    }
    return cells;
  }, [viewport, center, cellSize, bounds]);

  const toPixelPosition = (row: number, col: number) => ({
    left: viewport.width / 2 + (col - center.col) * cellSize - cellSize / 2,
    top: viewport.height / 2 + (row - center.row) * cellSize - cellSize / 2,
  });

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startCenterRow: center.row,
      startCenterCol: center.col,
      moved: false,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (!drag.moved && (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)) {
      drag.moved = true;
      setIsDragging(true);
    }
    if (drag.moved) {
      setCenter({
        row: clampAxis(drag.startCenterRow - dy / cellSize),
        col: clampAxis(drag.startCenterCol - dx / cellSize),
      });
    }
  };

  // Resolved here instead of a per-cell onClick: this container calls
  // setPointerCapture on press (needed so a drag keeps tracking once the
  // pointer leaves the board), and once a pointer is captured, browsers
  // retarget the native click event to the capturing element instead of
  // the button under the cursor — so a plain onClick on each cell never fires.
  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    dragRef.current = null;
    setIsDragging(false);
    if (drag.moved || disabled || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;
    const col = Math.floor((localX - viewport.width / 2) / cellSize + center.col + 0.5);
    const row = Math.floor((localY - viewport.height / 2) / cellSize + center.row + 0.5);
    if (bounds && (row < 0 || row >= bounds || col < 0 || col >= bounds)) return;
    if (getCellValue(board, row, col) !== null) return;
    onCellClick({ row, col });
  };

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    setZoomIndex((z) => {
      const next = e.deltaY < 0 ? z + 1 : z - 1;
      return Math.min(ZOOM_LEVELS.length - 1, Math.max(0, next));
    });
  };

  const zoomIn = () => setZoomIndex((z) => Math.min(ZOOM_LEVELS.length - 1, z + 1));
  const zoomOut = () => setZoomIndex((z) => Math.max(0, z - 1));
  const recenter = () => setCenter(lastMove ?? defaultCenter);

  const isGameOver = Boolean(winner);
  const ariaLabel = bounds
    ? `${bounds} by ${bounds} board. Drag to pan, use the zoom controls to zoom, click a cell to play.`
    : "Infinite board. Drag to pan, use the zoom controls to zoom, click a cell to play.";

  return (
    <div className="relative mx-auto w-full max-w-[min(92vw,32rem)] sm:max-w-md">
      <div
        aria-hidden
        className="absolute -inset-3 rounded-[28px] bg-gradient-to-br from-cyan-500/10 via-transparent to-fuchsia-500/10 blur-2xl"
      />
      <div
        ref={measuredRef}
        role="application"
        aria-label={ariaLabel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onWheel={handleWheel}
        className={cn(
          "relative aspect-square w-full touch-none select-none overflow-hidden rounded-2xl border border-slate-900/10 dark:border-white/10 bg-white/40 dark:bg-white/[0.04] shadow-2xl shadow-slate-900/10 dark:shadow-black/40 backdrop-blur-2xl",
          isDragging ? "cursor-grabbing" : "cursor-grab"
        )}
      >
        {visibleCells.map(({ row, col }) => {
          const value = getCellValue(board, row, col);
          const { left, top } = toPixelPosition(row, col);
          const isWinning = winningCells.some((c) => c.row === row && c.col === col);
          const isDimmed = isGameOver && winningCells.length > 0 && !isWinning;

          return (
            <button
              key={`${row},${col}`}
              type="button"
              tabIndex={-1}
              aria-label={value ? `Cell (${row}, ${col}), occupied by ${value}` : `Cell (${row}, ${col}), empty`}
              style={{
                position: "absolute",
                left: left + CELL_GAP / 2,
                top: top + CELL_GAP / 2,
                width: cellSize - CELL_GAP,
                height: cellSize - CELL_GAP,
              }}
              className={cn(
                "flex items-center justify-center rounded-md border transition-colors duration-150",
                "border-slate-900/10 dark:border-white/10 bg-white/40 dark:bg-white/[0.03]",
                !value && !disabled && "hover:bg-white/70 dark:hover:bg-white/[0.08]",
                isWinning &&
                  "border-emerald-400/80 bg-emerald-400/10 shadow-[0_0_20px_-2px_rgba(52,211,153,0.6)] animate-win-pulse",
                isDimmed && "opacity-30",
                disabled && "cursor-not-allowed"
              )}
            >
              {value && (
                <span
                  className={cn(
                    "animate-mark-in select-none font-black leading-none",
                    value === "X"
                      ? "text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-blue-500 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                      : "text-transparent bg-clip-text bg-gradient-to-br from-fuchsia-500 to-pink-500 drop-shadow-[0_0_10px_rgba(217,70,239,0.5)]"
                  )}
                  style={{ fontSize: cellSize * 0.5 }}
                >
                  {value}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="absolute bottom-3 right-3 flex flex-col gap-1.5" onPointerDown={(e) => e.stopPropagation()}>
        <ZoomButton onClick={zoomIn} disabled={zoomIndex === ZOOM_LEVELS.length - 1} label="Zoom in">
          <Plus className="h-4 w-4" />
        </ZoomButton>
        <ZoomButton onClick={zoomOut} disabled={zoomIndex === 0} label="Zoom out">
          <Minus className="h-4 w-4" />
        </ZoomButton>
        <ZoomButton onClick={recenter} label="Recenter on last move">
          <LocateFixed className="h-4 w-4" />
        </ZoomButton>
      </div>
    </div>
  );
}

function ZoomButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-900/10 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-slate-700 dark:text-slate-100 shadow-lg backdrop-blur-xl transition-colors hover:bg-white/90 dark:hover:bg-slate-900/90 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}
