import { createContext } from 'react'
import type { UserRole } from './userDirectory'

export type AuthUser = {
  id: string
  email: string
  displayName: string
  role: UserRole
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
  /** Re-sync profile from the API (member display name) or refresh expired tokens. */
  refreshSession: () => Promise<void>
  isAdmin: boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)
