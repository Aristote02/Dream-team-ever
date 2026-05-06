import { apiUrl } from './apiBase'

export type AuthResponseDto = {
  accessToken: string
  accessExpiresAtUtc: string
  refreshToken: string
  refreshExpiresAtUtc: string
  email: string
  role: string
  userId: string
  memberId: string | null
  phone?: string | null
  matriculeCode?: string | null
}

export type MemberDto = {
  id: string
  userId: string
  fullName: string
  email: string
  phone: string
  matriculeCode: string | null
  matriculeIssuedAt: string | null
  createdAt: string
}

export type PaymentTransactionDto = {
  id: string
  memberFullName: string | null
  method: string
  amount: number
  currency: string
  status: string
  providerReference: string | null
  createdAt: string
  completedAt: string | null
  failureReason: string | null
}

export type AdminMemberSummaryDto = {
  memberId: string
  userId: string
  fullName: string
  email: string
  phone: string
  role: 'Admin' | 'Member'
  matriculeCode: string | null
  matriculeIssuedAt: string | null
  createdAt: string
}

export type PagedResultDto<T> = {
  items: T[] | null
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

async function readJson(res: Response): Promise<unknown> {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text) as unknown
  } catch {
    return null
  }
}

export async function signInRequest(
  email: string,
  password: string,
): Promise<
  | { ok: true; data: AuthResponseDto }
  | { ok: false; status: number; message?: string }
> {
  const res = await fetch(apiUrl('/api/auth/sign-in'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), password }),
  })

  if (res.ok) {
    const data = (await readJson(res)) as AuthResponseDto
    return { ok: true, data }
  }

  if (res.status === 401) {
    return { ok: false, status: 401 }
  }

  const body = (await readJson(res)) as { error?: string } | null
  return {
    ok: false,
    status: res.status,
    message: typeof body?.error === 'string' ? body.error : undefined,
  }
}

export async function signUpRequest(
  fullName: string,
  email: string,
  phone: string,
  password: string,
): Promise<
  | { ok: true; data: AuthResponseDto }
  | { ok: false; status: number; message?: string }
> {
  const res = await fetch(apiUrl('/api/auth/sign-up'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
    }),
  })

  if (res.ok) {
    const data = (await readJson(res)) as AuthResponseDto
    return { ok: true, data }
  }

  if (res.status === 409) {
    return { ok: false, status: 409 }
  }

  const body = (await readJson(res)) as { error?: string } | null
  return {
    ok: false,
    status: res.status,
    message: typeof body?.error === 'string' ? body.error : undefined,
  }
}

export async function refreshTokensRequest(
  refreshToken: string,
): Promise<
  | { ok: true; data: AuthResponseDto }
  | { ok: false; status: number }
> {
  const res = await fetch(apiUrl('/api/auth/refresh'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  if (!res.ok) {
    return { ok: false, status: res.status }
  }

  const data = (await readJson(res)) as AuthResponseDto
  return { ok: true, data }
}

export async function fetchCurrentMember(
  accessToken: string,
): Promise<{ ok: true; data: MemberDto } | { ok: false; status: number }> {
  const res = await fetch(apiUrl('/api/members/me'), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  })

  if (!res.ok) {
    return { ok: false, status: res.status }
  }

  const data = (await readJson(res)) as MemberDto
  return { ok: true, data }
}

export async function updateMyProfileRequest(
  accessToken: string,
  fullName: string,
  phone: string,
): Promise<
  | { ok: true; data: MemberDto }
  | { ok: false; status: number; message?: string }
> {
  const res = await fetch(apiUrl('/api/members/me'), {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fullName: fullName.trim(),
      phone: phone.trim(),
    }),
  })

  if (res.ok) {
    const data = (await readJson(res)) as MemberDto
    return { ok: true, data }
  }

  const body = (await readJson(res)) as { error?: string; message?: string } | null
  return {
    ok: false,
    status: res.status,
    message:
      typeof body?.message === 'string'
        ? body.message
        : typeof body?.error === 'string'
          ? body.error
          : undefined,
  }
}

export async function signOutRequest(accessToken: string): Promise<boolean> {
  const res = await fetch(apiUrl('/api/auth/sign-out'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  })
  return res.ok || res.status === 204
}

export async function fetchMyPayments(
  accessToken: string,
): Promise<
  | { ok: true; data: PaymentTransactionDto[] }
  | { ok: false; status: number }
> {
  const res = await fetch(apiUrl('/api/members/me/payments'), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  })

  if (!res.ok) {
    return { ok: false, status: res.status }
  }

  const data = (await readJson(res)) as PaymentTransactionDto[]
  return { ok: true, data }
}

export async function fetchAdminMembers(
  accessToken: string,
): Promise<
  | { ok: true; data: AdminMemberSummaryDto[] }
  | { ok: false; status: number; message?: string }
> {
  const res = await fetch(apiUrl('/api/admin/members'), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  })

  if (res.ok) {
    const data = (await readJson(res)) as AdminMemberSummaryDto[]
    return { ok: true, data }
  }

  const body = (await readJson(res)) as { error?: string; message?: string } | null
  return {
    ok: false,
    status: res.status,
    message:
      typeof body?.message === 'string'
        ? body.message
        : typeof body?.error === 'string'
          ? body.error
          : undefined,
  }
}

export async function deleteAdminUser(
  accessToken: string,
  userId: string,
): Promise<{ ok: true } | { ok: false; status: number; message?: string }> {
  const res = await fetch(apiUrl(`/api/admin/users/${userId}`), {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  })

  if (res.ok) return { ok: true }

  const body = (await readJson(res)) as { error?: string; message?: string } | null
  return {
    ok: false,
    status: res.status,
    message:
      typeof body?.message === 'string'
        ? body.message
        : typeof body?.error === 'string'
          ? body.error
          : undefined,
  }
}

export async function fetchAdminPaymentsPaged(
  accessToken: string,
  pageNumber: number,
  pageSize: number,
): Promise<
  | { ok: true; data: PagedResultDto<PaymentTransactionDto> }
  | { ok: false; status: number; message?: string }
> {
  const params = new URLSearchParams({
    pageNumber: String(pageNumber),
    pageSize: String(pageSize),
  })

  const res = await fetch(apiUrl(`/api/admin/payments?${params.toString()}`), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  })

  if (res.ok) {
    const data = (await readJson(res)) as PagedResultDto<PaymentTransactionDto>
    return { ok: true, data }
  }

  const body = (await readJson(res)) as { error?: string; message?: string } | null
  return {
    ok: false,
    status: res.status,
    message:
      typeof body?.message === 'string'
        ? body.message
        : typeof body?.error === 'string'
          ? body.error
          : undefined,
  }
}
