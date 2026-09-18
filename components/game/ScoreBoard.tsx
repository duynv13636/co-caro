import type { Scores } from "@/types/game";

interface ScoreBoardProps {
  scores: Scores;
}

export function ScoreBoard({ scores }: ScoreBoardProps) {
  return (
    <div className="flex items-center justify-center gap-4 sm:gap-6 rounded-2xl border border-slate-900/10 dark:border-white/10 bg-white/40 dark:bg-white/5 px-4 py-3 backdrop-blur-xl text-sm">
      <ScoreItem label="Player X" value={scores.X} colorClass="text-cyan-500 dark:text-cyan-400" />
      <div className="h-8 w-px bg-slate-900/10 dark:bg-white/10" />
      <ScoreItem label="Draw" value={scores.draws} colorClass="text-slate-500 dark:text-slate-300" />
      <div className="h-8 w-px bg-slate-900/10 dark:bg-white/10" />
      <ScoreItem label="Player O" value={scores.O} colorClass="text-fuchsia-500 dark:text-fuchsia-400" />
    </div>
  );
}

function ScoreItem({ label, value, colorClass }: { label: string; value: number; colorClass: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className={`text-lg font-black tabular-nums ${colorClass}`}>{value}</span>
      <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</span>
    </div>
  );
}
