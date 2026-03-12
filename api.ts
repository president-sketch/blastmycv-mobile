import { API_BASE_URL } from "@/constants/api";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ message: "Network error" }));
    throw new Error(errData.message || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),

  postMultipart: async <T>(path: string, formData: FormData): Promise<T> => {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({ message: "Network error" }));
      throw new Error(errData.message || `HTTP ${res.status}`);
    }
    return res.json();
  },
};
