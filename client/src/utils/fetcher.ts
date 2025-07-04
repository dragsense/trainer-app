import { config } from "@/config";

export const BASE_API_URL = config.apiUrl;

export const fetcher = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  try {
    const res = await fetch(url, options);

    if (res.status === 204) return null as T;

    let payload: any;

    try {
      payload = await res.json();
    } catch (error) {
      throw new Error("Invalid JSON response from server");
    }

    if (!res.ok) {
      const errorMessage =
        payload?.error?.message || payload?.message || "Something went wrong";
      throw new Error(`API Error: ${errorMessage} (Status: ${res.status})`);
    }

    return payload as T;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export const apiRequest = async <T>(
  path: string,
  method: HttpMethod,
  body?: unknown,
  credentials: RequestCredentials | undefined = "include"
): Promise<T> => {
  return fetcher<T>(`${BASE_API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
    credentials,
  });
};

export const apiFileRequest = async <T>(
  path: string,
  data: any
): Promise<T> => {
  return fetcher<T>(`${BASE_API_URL}${path}`, {
    method: "POST",
    headers: {
    },
    body: data,
    cache: "no-store",
    credentials: "include",
  });
};
