"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Theme } from "@/types/game";
import { safeSetItem } from "@/lib/utils";

const THEME_KEY = "caro-ox:theme";
const THEME_EVENT = "caro-ox:theme-change";

function getSnapshot(): Theme {
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

function getServerSnapshot(): Theme {
  return "dark";
}

function subscribe(callback: () => void) {
  window.addEventListener(THEME_EVENT, callback);
  return () => window.removeEventListener(THEME_EVENT, callback);
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;
    root.classList.toggle("dark", next === "dark");
    root.classList.toggle("light", next === "light");
    safeSetItem(THEME_KEY, next);
    window.dispatchEvent(new Event(THEME_EVENT));
  }, [theme]);

  return { theme, toggleTheme };
}
