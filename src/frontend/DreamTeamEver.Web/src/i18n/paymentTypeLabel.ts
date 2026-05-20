import type { TranslationKey } from './translations'
import type { PaymentType } from '../types/payment'

type TFn = (key: TranslationKey) => string

export function paymentTypeLabel(t: TFn, paymentType: PaymentType | string): string {
  const normalized =
    paymentType === 'Registration' || paymentType === '0' ? 'Registration' : 'ScolarFee'
  if (normalized === 'Registration') return t('paymentType.registration')
  return t('paymentType.scolarFee')
}
