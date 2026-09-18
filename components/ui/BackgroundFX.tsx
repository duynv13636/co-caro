export function BackgroundFX() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-slate-50 dark:bg-[#020617] transition-colors duration-500"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-blue-50 to-white dark:from-[#020617] dark:via-[#0b1023] dark:to-[#0F172A]" />
      <div className="absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-blue-400/30 dark:bg-blue-500/20 blur-[120px]" />
      <div className="absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full bg-purple-400/25 dark:bg-purple-500/20 blur-[120px]" />
      <div className="absolute bottom-0 left-1/4 h-[24rem] w-[24rem] rounded-full bg-pink-300/20 dark:bg-pink-500/10 blur-[120px]" />
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04] bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:48px_48px]" />
    </div>
  );
}
