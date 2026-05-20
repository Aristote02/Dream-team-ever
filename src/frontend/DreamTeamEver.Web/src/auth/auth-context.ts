import { createContext } from 'react'
import type { PaymentType } from '../types/payment'

export type UserRole = 'admin' | 'student'

export type AuthUser = {
  id: string
  email: string
  displayName: string
  role: UserRole
  memberId: string | null
  phone: string | null
  matriculeCode: string | null
  matriculeIssuedAt: string | null
  createdAt: string | null
  registrationFeePaid: boolean
  scolarFeeActive: boolean
  scolarFeeExpiresAt: string | null
  nextPaymentType: PaymentType | null
  nextPaymentAmount: number | null
  currency: string
}

export type AuthContextValue = {
  user: AuthUser | null
  /** False until persisted session is validated (e.g. token refresh). Avoid redirect races. */
  authReady: boolean
  login: (
    email: string,
    password: string,
  ) => Promise<'ok' | 'invalid' | 'error'>
  register: (
    displayName: string,
    email: string,
    phone: string,
    password: string,
  ) => Promise<'ok' | 'email-taken' | 'invalid' | 'error'>
  logout: () => Promise<void>
  getAccessToken: () => Promise<string | null>
  /** Re-sync profile from the API (member display name) or refresh expired tokens. */
  refreshSession: () => Promise<void>
  isAdmin: boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)
