import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, authReady } = useAuth()
  if (!authReady) return null
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin')
    return <Navigate to="/home" replace />
  return children
}
