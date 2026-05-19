import { apiUrl } from './apiBase'
import type {
  InitiatePaymentRequest,
  PaymentConfirmationDto,
  PaymentTransactionDto,
  RegistrationConfigDto,
} from '../types/payment'

async function readJson(res: Response): Promise<unknown> {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text) as unknown
  } catch {
    return null
  }
}

function errorMessage(body: unknown): string | undefined {
  if (body && typeof body === 'object') {
    const o = body as { error?: string; message?: string }
    if (typeof o.message === 'string') return o.message
    if (typeof o.error === 'string') return o.error
  }
  return undefined
}

export async function fetchRegistrationConfig(): Promise<
  { ok: true; data: RegistrationConfigDto } | { ok: false; status: number; message?: string }
> {
  const res = await fetch(apiUrl('/api/config/registration'), {
    headers: { Accept: 'application/json' },
  })

  if (!res.ok) {
    return { ok: false, status: res.status, message: errorMessage(await readJson(res)) }
  }

  return { ok: true, data: (await readJson(res)) as RegistrationConfigDto }
}

export async function initiatePayment(
  accessToken: string,
  payload: InitiatePaymentRequest,
): Promise<
  | { ok: true; data: PaymentTransactionDto }
  | { ok: false; status: number; message?: string }
> {
  const res = await fetch(apiUrl('/api/payments/initiate'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    return { ok: false, status: res.status, message: errorMessage(await readJson(res)) }
  }

  return { ok: true, data: (await readJson(res)) as PaymentTransactionDto }
}

export async function confirmPayment(
  accessToken: string,
  paymentId: string,
): Promise<
  | { ok: true; data: PaymentConfirmationDto }
  | { ok: false; status: number; message?: string }
> {
  const res = await fetch(apiUrl(`/api/payments/${paymentId}/confirm`), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: '{}',
  })

  if (!res.ok) {
    return { ok: false, status: res.status, message: errorMessage(await readJson(res)) }
  }

  return { ok: true, data: (await readJson(res)) as PaymentConfirmationDto }
}
