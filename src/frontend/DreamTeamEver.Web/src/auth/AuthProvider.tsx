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
  type MemberDto,
} from '../api/authApi'
import { AuthContext, type AuthUser, type UserRole } from './auth-context'

const STORAGE_KEY = 'dreamteam-auth'

type PersistedSession = {
  accessToken: string
  refreshToken: string
  accessExpiresAtUtc: string
  refreshExpiresAtUtc: string
  user: AuthUser
}

type MemberSnapshot = {
  memberId: string | null
  displayName: string
  phone: string | null
  matriculeCode: string | null
  matriculeIssuedAt: string | null
  createdAt: string | null
  registrationFeePaid: boolean
  scolarFeeActive: boolean
  scolarFeeExpiresAt: string | null
  nextPaymentType: import('./auth-context').AuthUser['nextPaymentType']
  nextPaymentAmount: number | null
  currency: string
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
      memberId: auth.memberId,
      displayName: defaultDisplayName(auth.email, true),
      phone: null,
      matriculeCode: null,
      matriculeIssuedAt: null,
      createdAt: null,
      registrationFeePaid: false,
      scolarFeeActive: false,
      scolarFeeExpiresAt: null,
      nextPaymentType: null,
      nextPaymentAmount: null,
      currency: 'USD',
    }
  }

  const me = await fetchCurrentMember(accessToken)
  if (me.ok) {
    return memberSnapshotFromDto(me.data, trimmed)
  }

  return {
    memberId: auth.memberId,
    displayName: trimmed || defaultDisplayName(auth.email, false),
    phone: auth.phone ?? null,
    matriculeCode: auth.matriculeCode ?? null,
    matriculeIssuedAt: null,
    createdAt: null,
    registrationFeePaid: false,
    scolarFeeActive: false,
    scolarFeeExpiresAt: null,
    nextPaymentType: 'Registration',
    nextPaymentAmount: null,
    currency: 'USD',
  }
}

function memberSnapshotFromDto(
  data: MemberDto,
  displayNameOverride?: string,
): MemberSnapshot {
  return {
    memberId: data.id,
    displayName: displayNameOverride?.trim() || data.fullName,
    phone: data.phone,
    matriculeCode: data.matriculeCode,
    matriculeIssuedAt: data.matriculeIssuedAt,
    createdAt: data.createdAt,
    registrationFeePaid: data.registrationFeePaid,
    scolarFeeActive: data.scolarFeeActive,
    scolarFeeExpiresAt: data.scolarFeeExpiresAt,
    nextPaymentType: data.nextPaymentType,
    nextPaymentAmount: data.nextPaymentAmount,
    currency: data.currency,
  }
}

function buildUser(auth: AuthResponseDto, member: MemberSnapshot): AuthUser {
  return {
    id: auth.userId,
    email: auth.email,
    displayName: member.displayName,
    role: mapApiRole(auth.role),
    memberId: member.memberId ?? auth.memberId,
    phone: member.phone,
    matriculeCode: member.matriculeCode,
    matriculeIssuedAt: member.matriculeIssuedAt,
    createdAt: member.createdAt,
    registrationFeePaid: member.registrationFeePaid,
    scolarFeeActive: member.scolarFeeActive,
    scolarFeeExpiresAt: member.scolarFeeExpiresAt,
    nextPaymentType: member.nextPaymentType,
    nextPaymentAmount: member.nextPaymentAmount,
    currency: member.currency,
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
    const u = data.user
    if (u.role === 'student') {
      data.user = {
        ...u,
        memberId: u.memberId ?? null,
        registrationFeePaid: u.registrationFeePaid ?? false,
        scolarFeeActive: u.scolarFeeActive ?? false,
        scolarFeeExpiresAt: u.scolarFeeExpiresAt ?? null,
        nextPaymentType: u.nextPaymentType ?? 'Registration',
        nextPaymentAmount: u.nextPaymentAmount ?? null,
        currency: u.currency ?? 'USD',
      }
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
      return 'ok'
    },
    [],
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
    const snap = memberSnapshotFromDto(me.data)
    const u = session.user
    if (
      snap.displayName === u.displayName &&
      snap.phone === u.phone &&
      snap.matriculeCode === u.matriculeCode &&
      snap.matriculeIssuedAt === u.matriculeIssuedAt &&
      snap.createdAt === u.createdAt &&
      snap.registrationFeePaid === u.registrationFeePaid &&
      snap.scolarFeeActive === u.scolarFeeActive &&
      snap.scolarFeeExpiresAt === u.scolarFeeExpiresAt &&
      snap.nextPaymentType === u.nextPaymentType &&
      snap.nextPaymentAmount === u.nextPaymentAmount &&
      snap.currency === u.currency
    ) {
      return
    }

    const nextUser: AuthUser = {
      ...session.user,
      ...snap,
      id: u.id,
      email: u.email,
      role: u.role,
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
