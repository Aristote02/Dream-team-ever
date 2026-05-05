import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  fetchCurrentMember,
  refreshTokensRequest,
  signInRequest,
  signOutRequest,
  signUpRequest,
  type AuthResponseDto,
} from '../api/authApi'
import { AuthContext, type AuthUser } from './auth-context'
import type { UserRole } from './userDirectory'

const STORAGE_KEY = 'dreamteam-auth'

type PersistedSession = {
  accessToken: string
  refreshToken: string
  accessExpiresAtUtc: string
  refreshExpiresAtUtc: string
  user: AuthUser
}

type MemberSnapshot = {
  displayName: string
  phone: string | null
  matriculeCode: string | null
  matriculeIssuedAt: string | null
  createdAt: string | null
}

function mapApiRole(role: string): UserRole {
  return role === 'Admin' ? 'admin' : 'student'
}

function defaultDisplayName(email: string, isAdminUser: boolean): string {
  if (isAdminUser) return 'Administrator'
  return email.split('@')[0] ?? email
}

async function resolveMemberSnapshot(
  auth: AuthResponseDto,
  accessToken: string,
  signupFullName?: string,
): Promise<MemberSnapshot> {
  const trimmed = signupFullName?.trim()
  if (auth.role === 'Admin') {
    return {
      displayName: defaultDisplayName(auth.email, true),
      phone: null,
      matriculeCode: null,
      matriculeIssuedAt: null,
      createdAt: null,
    }
  }

  const me = await fetchCurrentMember(accessToken)
  if (me.ok) {
    return {
      displayName: trimmed || me.data.fullName,
      phone: me.data.phone,
      matriculeCode: me.data.matriculeCode,
      matriculeIssuedAt: me.data.matriculeIssuedAt,
      createdAt: me.data.createdAt,
    }
  }

  return {
    displayName: trimmed || defaultDisplayName(auth.email, false),
    phone: auth.phone ?? null,
    matriculeCode: auth.matriculeCode ?? null,
    matriculeIssuedAt: null,
    createdAt: null,
  }
}

function buildUser(auth: AuthResponseDto, member: MemberSnapshot): AuthUser {
  return {
    id: auth.userId,
    email: auth.email,
    displayName: member.displayName,
    role: mapApiRole(auth.role),
    phone: member.phone,
    matriculeCode: member.matriculeCode,
    matriculeIssuedAt: member.matriculeIssuedAt,
    createdAt: member.createdAt,
  }
}

function readSession(): PersistedSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as PersistedSession
    if (
      typeof data.accessToken !== 'string' ||
      typeof data.refreshToken !== 'string' ||
      typeof data.accessExpiresAtUtc !== 'string' ||
      typeof data.refreshExpiresAtUtc !== 'string' ||
      !data.user ||
      typeof data.user.id !== 'string' ||
      typeof data.user.email !== 'string' ||
      typeof data.user.displayName !== 'string' ||
      (data.user.phone !== null && typeof data.user.phone !== 'string') ||
      (data.user.matriculeCode !== null &&
        typeof data.user.matriculeCode !== 'string') ||
      (data.user.matriculeIssuedAt !== null &&
        typeof data.user.matriculeIssuedAt !== 'string') ||
      (data.user.createdAt !== null && typeof data.user.createdAt !== 'string') ||
      (data.user.role !== 'admin' && data.user.role !== 'student')
    ) {
      return null
    }
    return data
  } catch {
    return null
  }
}

function accessValid(session: PersistedSession, skewMs = 30_000): boolean {
  const exp = Date.parse(session.accessExpiresAtUtc)
  if (Number.isNaN(exp)) return false
  return Date.now() < exp - skewMs
}

function refreshValid(session: PersistedSession): boolean {
  const exp = Date.parse(session.refreshExpiresAtUtc)
  if (Number.isNaN(exp)) return false
  return Date.now() < exp
}

function persistSession(session: PersistedSession) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [authReady, setAuthReady] = useState(false)

  const applyAuthResponse = useCallback(
    async (
      auth: AuthResponseDto,
      options?: { signupFullName?: string },
    ): Promise<void> => {
      const member = await resolveMemberSnapshot(
        auth,
        auth.accessToken,
        options?.signupFullName,
      )
      const nextUser = buildUser(auth, member)
      const session: PersistedSession = {
        accessToken: auth.accessToken,
        refreshToken: auth.refreshToken,
        accessExpiresAtUtc: auth.accessExpiresAtUtc,
        refreshExpiresAtUtc: auth.refreshExpiresAtUtc,
        user: nextUser,
      }
      persistSession(session)
      setUser(nextUser)
    },
    [],
  )

  useEffect(() => {
    let cancelled = false

    async function init() {
      const session = readSession()
      if (!session) {
        if (!cancelled) setAuthReady(true)
        return
      }

      if (accessValid(session)) {
        if (!cancelled) {
          setUser(session.user)
          setAuthReady(true)
        }
        return
      }

      if (refreshValid(session)) {
        const refreshed = await refreshTokensRequest(session.refreshToken)
        if (cancelled) return
        if (refreshed.ok) {
          await applyAuthResponse(refreshed.data)
        } else {
          localStorage.removeItem(STORAGE_KEY)
          setUser(null)
        }
        setAuthReady(true)
        return
      }

      localStorage.removeItem(STORAGE_KEY)
      if (!cancelled) {
        setUser(null)
        setAuthReady(true)
      }
    }

    void init()
    return () => {
      cancelled = true
    }
  }, [applyAuthResponse])

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await signInRequest(email, password)
      if (!result.ok) {
        if (result.status === 401) return 'invalid'
        return 'error'
      }
      await applyAuthResponse(result.data)
      return 'ok'
    },
    [applyAuthResponse],
  )

  const register = useCallback(
    async (
      displayName: string,
      email: string,
      phone: string,
      password: string,
    ) => {
      const name = displayName.trim()
      const mail = email.trim()
      const ph = phone.trim()
      if (!name || !mail || !ph || !password) return 'invalid'

      const result = await signUpRequest(name, mail, ph, password)
      if (!result.ok) {
        if (result.status === 409) return 'email-taken'
        return 'error'
      }
      await applyAuthResponse(result.data, { signupFullName: name })
      return 'ok'
    },
    [applyAuthResponse],
  )

  const logout = useCallback(async () => {
    const session = readSession()
    if (session && accessValid(session)) {
      try {
        await signOutRequest(session.accessToken)
      } catch {
        /* still clear client session */
      }
    }
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }, [])

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    const session = readSession()
    if (!session) return null

    if (accessValid(session)) return session.accessToken

    if (!refreshValid(session)) {
      localStorage.removeItem(STORAGE_KEY)
      setUser(null)
      return null
    }

    const refreshed = await refreshTokensRequest(session.refreshToken)
    if (!refreshed.ok) {
      localStorage.removeItem(STORAGE_KEY)
      setUser(null)
      return null
    }

    await applyAuthResponse(refreshed.data)
    return refreshed.data.accessToken
  }, [applyAuthResponse])

  const refreshSession = useCallback(async () => {
    const session = readSession()
    if (!session) {
      setUser(null)
      return
    }

    if (!accessValid(session)) {
      if (!refreshValid(session)) {
        localStorage.removeItem(STORAGE_KEY)
        setUser(null)
        return
      }
      const r = await refreshTokensRequest(session.refreshToken)
      if (!r.ok) {
        localStorage.removeItem(STORAGE_KEY)
        setUser(null)
        return
      }
      await applyAuthResponse(r.data)
      return
    }

    if (session.user.role === 'admin') return

    const me = await fetchCurrentMember(session.accessToken)
    if (!me.ok) return
    if (
      me.data.fullName === session.user.displayName &&
      me.data.phone === session.user.phone &&
      me.data.matriculeCode === session.user.matriculeCode &&
      me.data.matriculeIssuedAt === session.user.matriculeIssuedAt &&
      me.data.createdAt === session.user.createdAt
    ) {
      return
    }

    const nextUser: AuthUser = {
      ...session.user,
      displayName: me.data.fullName,
      phone: me.data.phone,
      matriculeCode: me.data.matriculeCode,
      matriculeIssuedAt: me.data.matriculeIssuedAt,
      createdAt: me.data.createdAt,
    }
    const next: PersistedSession = { ...session, user: nextUser }
    persistSession(next)
    setUser(nextUser)
  }, [applyAuthResponse])

  const isAdmin = user?.role === 'admin'

  const value = useMemo(
    () => ({
      user,
      authReady,
      login,
      register,
      logout,
      getAccessToken,
      refreshSession,
      isAdmin,
    }),
    [
      user,
      authReady,
      login,
      register,
      logout,
      getAccessToken,
      refreshSession,
      isAdmin,
    ],
  )

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}
