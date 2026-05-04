/**
 * Point `VITE_API_URL` at your backend (no trailing slash).
 * Example: https://api.example.com or http://localhost:4000
 */
export function getApiBaseUrl(): string {
  const base = import.meta.env.VITE_API_URL?.trim()
  if (!base) {
    console.warn(
      'VITE_API_URL is not set. Create .env with VITE_API_URL=https://your-backend',
    )
    return ''
  }
  return base.replace(/\/$/, '')
}
