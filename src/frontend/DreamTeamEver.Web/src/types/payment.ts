/** Backend enums are serialized as strings (JsonStringEnumConverter). */

export type PaymentType = 'Registration' | 'ScolarFee'

export type PaymentMethod = 'Mpesa' | 'OrangeMoney'

export type PaymentStatus = 'Pending' | 'Completed' | 'Failed' | 'Cancelled'

export type RegistrationConfigDto = {
  registrationFee: number
  scolarFee: number
  scolarFeeValidityDays: number
  currency: string
  allowPaymentSimulation: boolean
  mpesaEnabled: boolean
}

export type InitiatePaymentRequest = {
  memberId: string
  method: PaymentMethod
}

export type PaymentTransactionDto = {
  id: string
  memberFullName: string | null
  paymentType: PaymentType
  method: PaymentMethod
  amount: number
  currency: string
  status: PaymentStatus
  providerReference: string | null
  createdAt: string
  completedAt: string | null
  failureReason: string | null
}

export type PaymentConfirmationDto = {
  matriculeCode: string | null
  transaction: PaymentTransactionDto | null
}
