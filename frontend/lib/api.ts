const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function apiClient<T>(path: string, options?: RequestInit, token?: string): Promise<T> {
  const headers: HeadersInit = { 'Content-Type': 'application/json', ...(options?.headers || {}) }
  if (token) (headers as any)['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(err.detail || 'Request failed')
  }
  return res.json()
}
