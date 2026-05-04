import { getApiBaseUrl } from '../lib/config'

export class ApiError extends Error {
  readonly status: number
  readonly body: unknown | undefined

  constructor(message: string, status: number, body?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: object
}

/**
 * JSON fetch to your backend. Adjust paths and shapes to match your API.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const base = getApiBaseUrl()
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`

  const { body, headers: initHeaders, ...rest } = options
  const headers = new Headers(initHeaders)

  if (body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(url, {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const text = await res.text()
  let data: unknown
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }

  if (!res.ok) {
    throw new ApiError(
      typeof data === 'object' && data !== null && 'message' in data
        ? String((data as { message: unknown }).message)
        : res.statusText || 'Request failed',
      res.status,
      data,
    )
  }

  return data as T
}
