export const TOKEN_KEY = "sdlc.token";

export function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function setToken(t: string): void {
  localStorage.setItem(TOKEN_KEY, t);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      ...(init.headers || {}),
      Authorization: `Bearer ${getToken()}`,
    },
  });
  if (res.status === 401) {
    clearToken();
    throw new Error("unauthorized");
  }
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export type Run = {
  id: string;
  issue_id: string;
  issue_identifier: string;
  title: string;
  description: string;
  status: string;
  branch: string | null;
  pr_number: number | null;
  heal_attempts: number;
  created_at: string;
  updated_at: string;
};

export type RunEvent = {
  id: string;
  run_id: string;
  stage: string;
  level: string;
  message: string;
  payload: Record<string, unknown>;
  created_at: string;
};

export type Summary = {
  total: number;
  by_status: Record<string, number>;
  last_24h: number;
  done_24h: number;
  failed_24h: number;
};
