import { safeGetItem, safeSetItem } from "./utils";

type Listener = () => void;

export function createPersistedStore<T>(key: string, defaultValue: T) {
  let cache: T = defaultValue;
  let initialized = false;
  const listeners = new Set<Listener>();

  const readFromStorage = (): T => {
    const raw = safeGetItem(key);
    if (!raw) return defaultValue;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  };

  const ensureInitialized = () => {
    if (initialized || typeof window === "undefined") return;
    cache = readFromStorage();
    initialized = true;
  };

  const getSnapshot = (): T => {
    ensureInitialized();
    return cache;
  };

  const getServerSnapshot = (): T => defaultValue;

  const subscribe = (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const set = (value: T | ((prev: T) => T)) => {
    ensureInitialized();
    const next = typeof value === "function" ? (value as (prev: T) => T)(cache) : value;
    cache = next;
    initialized = true;
    safeSetItem(key, JSON.stringify(next));
    listeners.forEach((listener) => listener());
  };

  return { getSnapshot, getServerSnapshot, subscribe, set };
}
