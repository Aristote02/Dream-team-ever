/** Base URL for the Dream Team Ever API. Empty string = same origin (use Vite proxy in dev). */
export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL
  if (raw !== undefined && raw !== '') {
    return raw.replace(/\/$/, '')
  }
  return ''
}

export function apiUrl(path: string): string {
  const base = getApiBaseUrl()
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}
