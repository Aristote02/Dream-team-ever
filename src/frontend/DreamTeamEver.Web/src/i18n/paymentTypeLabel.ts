import type { PaymentType } from '../types/payment'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TFn = (key: any) => string

export function paymentTypeLabel(t: TFn, paymentType: PaymentType): string {
  if (paymentType === 'Registration') return t('paymentType.registration')
  return t('paymentType.scolarFee')
}
