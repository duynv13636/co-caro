"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Theme } from "@/types/game";
import { Button } from "./Button";

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === "dark";
  return (
    <Button
      variant="icon"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={onToggle}
    >
      <span className="relative block h-5 w-5">
        <Sun
          className={cn(
            "absolute inset-0 h-5 w-5 transition-all duration-300",
            isDark ? "scale-0 -rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
          )}
        />
        <Moon
          className={cn(
            "absolute inset-0 h-5 w-5 transition-all duration-300",
            isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-90 opacity-0"
          )}
        />
      </span>
    </Button>
  );
}
