import { useCallback, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authInputClassName } from '../components/authInputClass'
import { useAuth } from '../auth/useAuth'
import {
  deleteUser,
  ensureDirectorySeeded,
  listStudents,
  toggleUserRole,
  updateUser,
  type DirectoryUser,
} from '../auth/userDirectory'

export function StudentsPage() {
  const { user, refreshSession, logout } = useAuth()
  const navigate = useNavigate()
  const [rows, setRows] = useState<DirectoryUser[]>(() => {
    ensureDirectorySeeded()
    return listStudents()
  })
  const [editing, setEditing] = useState<DirectoryUser | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const reload = useCallback(() => {
    ensureDirectorySeeded()
    setRows(listStudents())
  }, [])

  const openEdit = useCallback((row: DirectoryUser) => {
    setFormError(null)
    setNewPassword('')
    setEditing({ ...row })
  }, [])

  function closeEdit() {
    setEditing(null)
    setNewPassword('')
    setFormError(null)
  }

  function onSaveEdit(e: FormEvent) {
    e.preventDefault()
    if (!editing) return
    setFormError(null)
    const patch: Partial<
      Pick<
        DirectoryUser,
        'email' | 'password' | 'displayName' | 'matricule' | 'phone'
      >
    > = {
      email: editing.email,
      displayName: editing.displayName,
      matricule: editing.matricule,
      phone: editing.phone,
    }
    if (newPassword.trim()) patch.password = newPassword.trim()
    const result = updateUser(editing.id, patch)
    if (!result.ok) {
      if (result.reason === 'email-taken')
        setFormError('That email is already used by another user.')
      else if (result.reason === 'last-admin')
        setFormError('You cannot remove the last administrator.')
      else setFormError('Could not save changes.')
      return
    }
    setMessage('User updated.')
    closeEdit()
    reload()
    if (user?.id === editing.id) void refreshSession()
    window.setTimeout(() => setMessage(null), 3000)
  }

  function onDelete(row: DirectoryUser) {
    if (
      !window.confirm(
        `Delete ${row.displayName} (${row.email})? This cannot be undone.`,
      )
    )
      return
    const result = deleteUser(row.id)
    if (!result.ok) {
      if (result.reason === 'last-admin') {
        window.alert('Cannot delete the only administrator.')
      }
      return
    }
    reload()
    if (user?.id === row.id) {
      void logout().then(() => navigate('/login', { replace: true }))
      return
    }
    setMessage('User deleted.')
    window.setTimeout(() => setMessage(null), 3000)
  }

  function onToggleAdmin(row: DirectoryUser) {
    const result = toggleUserRole(row.id)
    if (!result.ok) {
      if (result.reason === 'last-admin') {
        window.alert(
          'Cannot remove admin role from the only administrator.',
        )
      }
      return
    }
    reload()
    if (user?.id === row.id) void refreshSession()
    setMessage(
      result.user.role === 'admin' ? 'User is now an admin.' : 'Admin role removed.',
    )
    window.setTimeout(() => setMessage(null), 3000)
  }

  const sortedRows = useMemo(
    () =>
      [...rows].sort((a, b) =>
        a.displayName.localeCompare(b.displayName, undefined, {
          sensitivity: 'base',
        }),
      ),
    [rows],
  )

  return (
    <div className="font-dream-sans -mx-6 -mt-2 text-left">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-dream-serif text-xl font-semibold text-stone-900">
            Students
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Manage members: matricule, phone, roles, and accounts (local demo
            data).
          </p>
        </div>
        <Link
          to="/home"
          className="text-sm font-medium text-amber-800 underline-offset-4 hover:underline"
        >
          Back to wallet
        </Link>
      </div>

      {message ? (
        <p
          className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800 ring-1 ring-emerald-200/80"
          role="status"
        >
          {message}
        </p>
      ) : null}

      <div className="mt-6 overflow-x-auto rounded-xl border border-stone-200/80 bg-white shadow-sm ring-1 ring-stone-100">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50/80 text-stone-600">
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Email</th>
              <th className="px-3 py-2 font-medium">Matricule</th>
              <th className="px-3 py-2 font-medium">Phone</th>
              <th className="px-3 py-2 font-medium">Role</th>
              <th className="px-3 py-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-stone-100 last:border-0"
              >
                <td className="px-3 py-2 font-medium text-stone-900">
                  {row.displayName}
                </td>
                <td className="px-3 py-2 text-stone-700">{row.email}</td>
                <td className="px-3 py-2 font-mono text-xs text-stone-800">
                  {row.matricule || '—'}
                </td>
                <td className="px-3 py-2 font-mono text-xs text-stone-700">
                  {row.phone || '—'}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={
                      row.role === 'admin'
                        ? 'rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900'
                        : 'rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-700'
                    }
                  >
                    {row.role === 'admin' ? 'Admin' : 'Student'}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap justify-end gap-1">
                    <button
                      type="button"
                      className="rounded-md border border-stone-200 bg-white px-2 py-1 text-xs font-medium text-stone-700 hover:bg-stone-50"
                      onClick={() => openEdit(row)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-stone-200 bg-white px-2 py-1 text-xs font-medium text-stone-700 hover:bg-stone-50"
                      onClick={() => onToggleAdmin(row)}
                    >
                      {row.role === 'admin' ? 'Make student' : 'Make admin'}
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                      onClick={() => onDelete(row)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-user-title"
        >
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl ring-1 ring-stone-200">
            <h2
              id="edit-user-title"
              className="font-dream-serif text-lg font-semibold text-stone-900"
            >
              Edit user
            </h2>
            <form className="mt-4 space-y-4" onSubmit={onSaveEdit}>
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">
                  Display name
                </label>
                <input
                  className={authInputClassName}
                  value={editing.displayName}
                  onChange={(e) =>
                    setEditing({ ...editing, displayName: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">
                  Email
                </label>
                <input
                  type="email"
                  className={authInputClassName}
                  value={editing.email}
                  onChange={(e) =>
                    setEditing({ ...editing, email: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">
                  Matricule
                </label>
                <input
                  className={authInputClassName}
                  value={editing.matricule}
                  onChange={(e) =>
                    setEditing({ ...editing, matricule: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">
                  Phone
                </label>
                <input
                  type="tel"
                  className={authInputClassName}
                  value={editing.phone}
                  onChange={(e) =>
                    setEditing({ ...editing, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">
                  New password
                </label>
                <input
                  type="password"
                  className={authInputClassName}
                  autoComplete="new-password"
                  placeholder="Leave blank to keep current"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              {formError ? (
                <p className="text-sm text-red-700" role="alert">
                  {formError}
                </p>
              ) : null}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  className="flex-1 rounded-lg border border-stone-200 py-2.5 text-sm font-medium text-stone-800 hover:bg-stone-50"
                  onClick={closeEdit}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-gradient-to-b from-amber-500 to-amber-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-amber-600 hover:to-amber-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
