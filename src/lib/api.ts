export const juiceFetch = (path: string, init?: RequestInit) =>
  fetch(`/api${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
