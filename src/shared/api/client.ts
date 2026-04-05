const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 'http://127.0.0.1:4000'

export async function fetchJson<T>(path: string): Promise<T> {
  const url = `${API_BASE_URL}${path}`
  let response: Response

  try {
    response = await fetch(url)
  } catch {
    throw new Error(
      `Cannot reach API server (${url}). Start json-server with "npm run server" or run both with "npm run dev:all".`,
    )
  }

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }

  return (await response.json()) as T
}
