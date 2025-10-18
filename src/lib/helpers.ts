import { API_URL } from "./config";

export async function fetchQuery<T>(path: string, options?: RequestInit) {
  const url = `${API_URL}${path}`;
  const response = await fetch(url, {
    cache: "no-store",
    ...options,
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }

  const data = (await response.json()) as T;

  return data;
}

export async function fetchImageUrl(imageKey: string): Promise<string> {
  const { url } = await fetchQuery<{ url: string }>(`/files/${imageKey}`);
  return url;
}
