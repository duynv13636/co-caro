"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface RoomShareCardProps {
  code: string;
}

export function RoomShareCard({ code }: RoomShareCardProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/room/${code}` : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable — the link is still visible for manual copy
    }
  };

  return (
    <div className="rounded-2xl border border-slate-900/10 dark:border-white/10 bg-white/50 dark:bg-white/5 p-5 text-center backdrop-blur-xl">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
        Room Code
      </p>
      <p className="mt-1 text-3xl font-black tracking-[0.3em] bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">
        {code}
      </p>
      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
        Share this link with a friend to play together
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-center">
        <code className="truncate rounded-xl border border-slate-900/10 dark:border-white/10 bg-white/60 dark:bg-black/20 px-3 py-2 text-xs text-slate-600 dark:text-slate-300">
          {shareUrl}
        </code>
        <Button variant="secondary" onClick={handleCopy} className="justify-center">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy Link"}
        </Button>
      </div>
    </div>
  );
}
