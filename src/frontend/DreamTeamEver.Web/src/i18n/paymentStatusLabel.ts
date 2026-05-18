import { translate } from './translations'
import type { Locale, TranslationKey } from './translations'

type TFn = typeof translate extends (locale: Locale, key: TranslationKey, params?: infer P) => string
  ? (key: TranslationKey, params?: P) => string
  : never

const STATUS_KEYS: Record<string, TranslationKey> = {
  Pending: 'paymentStatus.Pending',
  Completed: 'paymentStatus.Completed',
  Failed: 'paymentStatus.Failed',
  Cancelled: 'paymentStatus.Cancelled',
}

export function paymentStatusLabel(t: TFn, status: string): string {
  const key = STATUS_KEYS[status]
  return key ? t(key) : status
}
