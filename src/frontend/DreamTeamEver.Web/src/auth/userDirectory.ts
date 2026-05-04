const DIRECTORY_KEY = 'dreamteam-directory'
const LEGACY_REGISTERED_KEY = 'dreamteam-registered-users'

export type UserRole = 'admin' | 'student'

export type DirectoryUser = {
  id: string
  email: string
  password: string
  displayName: string
  role: UserRole
  matricule: string
  phone: string
}

function newId(): string {
  return crypto.randomUUID()
}

function randomMatricule(): string {
  const n = Math.floor(1000 + Math.random() * 9000)
  return `DT-2025-R-${n}`
}

/** Initial seed (IDs stable for predictable demo data). */
export const SEED_USERS: DirectoryUser[] = [
  {
    id: 'seed-admin',
    email: 'admin@dreamteam.com',
    password: 'Admin2025',
    displayName: 'Administrator',
    role: 'admin',
    matricule: 'DT-2025-ADM-0001',
    phone: '+243900000001',
  },
  {
    id: 'seed-member',
    email: 'member@dreamteam.com',
    password: 'Ever2025',
    displayName: 'Dream Team Member',
    role: 'student',
    matricule: 'DT-2025-KSH-8842',
    phone: '4451288842',
  },
  {
    id: 'seed-kinshasa',
    email: 'kinshasa@dreamteam.com',
    password: 'K2025',
    displayName: 'Kinshasa Chapter',
    role: 'student',
    matricule: 'DT-2025-KIN-2201',
    phone: '',
  },
]

export function readDirectory(): DirectoryUser[] {
  try {
    const raw = localStorage.getItem(DIRECTORY_KEY)
    if (!raw) return []
    const data = JSON.parse(raw) as unknown
    if (!Array.isArray(data)) return []
    return data.filter(isDirectoryUser).map(normalizeUser)
  } catch {
    return []
  }
}

function isDirectoryUser(row: unknown): row is DirectoryUser {
  if (typeof row !== 'object' || row === null) return false
  const u = row as Record<string, unknown>
  const roleOk = u.role === 'admin' || u.role === 'student'
  if (!roleOk) return false
  return (
    typeof u.id === 'string' &&
    typeof u.email === 'string' &&
    typeof u.password === 'string' &&
    typeof u.displayName === 'string' &&
    typeof u.matricule === 'string' &&
    (typeof u.phone === 'string' || u.phone === undefined)
  )
}

function normalizeUser(row: DirectoryUser): DirectoryUser {
  return {
    ...row,
    phone: typeof row.phone === 'string' ? row.phone : '',
    role: row.role === 'admin' ? 'admin' : 'student',
  }
}

export function writeDirectory(users: DirectoryUser[]): void {
  localStorage.setItem(DIRECTORY_KEY, JSON.stringify(users))
}

/** One-time init + migrate legacy `dreamteam-registered-users`. */
export function ensureDirectorySeeded(): DirectoryUser[] {
  let list = readDirectory()
  if (list.length === 0) {
    list = [...SEED_USERS]
    try {
      const legacyRaw = localStorage.getItem(LEGACY_REGISTERED_KEY)
      if (legacyRaw) {
        const legacy = JSON.parse(legacyRaw) as Array<{
          email: string
          password: string
          displayName: string
        }>
        if (Array.isArray(legacy)) {
          for (const row of legacy) {
            if (
              row?.email &&
              row?.password &&
              row?.displayName &&
              !list.some(
                (u) => u.email.toLowerCase() === row.email.toLowerCase(),
              )
            ) {
              list.push({
                id: newId(),
                email: row.email.trim(),
                password: row.password,
                displayName: row.displayName.trim(),
                role: 'student',
                matricule: randomMatricule(),
                phone: '',
              })
            }
          }
        }
      }
    } catch {
      /* ignore */
    }
    writeDirectory(list)
  }
  return list
}

export function findByCredentials(
  email: string,
  password: string,
): DirectoryUser | undefined {
  ensureDirectorySeeded()
  const lower = email.trim().toLowerCase()
  return readDirectory().find(
    (u) => u.email.toLowerCase() === lower && u.password === password,
  )
}

export function findById(id: string): DirectoryUser | undefined {
  ensureDirectorySeeded()
  return readDirectory().find((u) => u.id === id)
}

export function findByEmail(email: string): DirectoryUser | undefined {
  ensureDirectorySeeded()
  const lower = email.trim().toLowerCase()
  return readDirectory().find((u) => u.email.toLowerCase() === lower)
}

export function emailTaken(email: string, exceptId?: string): boolean {
  ensureDirectorySeeded()
  const lower = email.trim().toLowerCase()
  return readDirectory().some(
    (u) =>
      u.email.toLowerCase() === lower && (!exceptId || u.id !== exceptId),
  )
}

export function addUser(record: Omit<DirectoryUser, 'id'> & { id?: string }) {
  ensureDirectorySeeded()
  const list = readDirectory()
  const user: DirectoryUser = {
    ...record,
    id: record.id ?? newId(),
    email: record.email.trim(),
    displayName: record.displayName.trim(),
    matricule: (record.matricule ?? '').trim() || randomMatricule(),
    phone: (record.phone ?? '').trim(),
  }
  list.push(user)
  writeDirectory(list)
  return user
}

function countAdmins(users: DirectoryUser[]): number {
  return users.filter((u) => u.role === 'admin').length
}

export type UpdateUserResult =
  | { ok: true; user: DirectoryUser }
  | { ok: false; reason: 'not-found' | 'email-taken' | 'last-admin' }

export function updateUser(
  id: string,
  patch: Partial<
    Pick<
      DirectoryUser,
      'email' | 'password' | 'displayName' | 'role' | 'matricule' | 'phone'
    >
  >,
): UpdateUserResult {
  ensureDirectorySeeded()
  const list = readDirectory()
  const i = list.findIndex((u) => u.id === id)
  if (i === -1) return { ok: false, reason: 'not-found' }

  const prev = list[i]
  const next = { ...prev }
  if (patch.email !== undefined) next.email = patch.email.trim()
  if (patch.password !== undefined && patch.password !== '')
    next.password = patch.password
  if (patch.displayName !== undefined)
    next.displayName = patch.displayName.trim()
  if (patch.role !== undefined) next.role = patch.role
  if (patch.matricule !== undefined) next.matricule = patch.matricule.trim()
  if (patch.phone !== undefined) next.phone = patch.phone.trim()

  if (
    emailTaken(next.email, id) &&
    next.email.toLowerCase() !== prev.email.toLowerCase()
  ) {
    return { ok: false, reason: 'email-taken' }
  }

  if (
    prev.role === 'admin' &&
    next.role === 'student' &&
    countAdmins(list) <= 1
  ) {
    return { ok: false, reason: 'last-admin' }
  }

  list[i] = next
  writeDirectory(list)
  return { ok: true, user: next }
}

export type DeleteUserResult =
  | { ok: true }
  | { ok: false; reason: 'not-found' | 'last-admin' }

export function deleteUser(id: string): DeleteUserResult {
  ensureDirectorySeeded()
  const list = readDirectory()
  const target = list.find((u) => u.id === id)
  if (!target) return { ok: false, reason: 'not-found' }
  if (target.role === 'admin' && countAdmins(list) <= 1) {
    return { ok: false, reason: 'last-admin' }
  }
  const filtered = list.filter((u) => u.id !== id)
  writeDirectory(filtered)
  return { ok: true }
}

export type ToggleRoleResult =
  | { ok: true; user: DirectoryUser }
  | { ok: false; reason: 'not-found' | 'last-admin' }

export function toggleUserRole(id: string): ToggleRoleResult {
  const u = findById(id)
  if (!u) return { ok: false, reason: 'not-found' }
  const nextRole: UserRole = u.role === 'admin' ? 'student' : 'admin'
  const result = updateUser(id, { role: nextRole })
  if (!result.ok) {
    if (result.reason === 'last-admin') return { ok: false, reason: 'last-admin' }
    return { ok: false, reason: 'not-found' }
  }
  return { ok: true, user: result.user }
}

export function listStudents(): DirectoryUser[] {
  ensureDirectorySeeded()
  return readDirectory()
}
