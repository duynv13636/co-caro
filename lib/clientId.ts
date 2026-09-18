import { safeGetItem, safeSetItem } from "./utils";

const CLIENT_ID_KEY = "caro-ox:clientId";

export function getClientId(): string {
  if (typeof window === "undefined") return "";
  const existing = safeGetItem(CLIENT_ID_KEY);
  if (existing) return existing;
  const id = generateId();
  safeSetItem(CLIENT_ID_KEY, id);
  return id;
}

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `client-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
