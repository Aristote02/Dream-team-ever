import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { authInputClassName } from '../components/authInputClass'
import { useAuth } from '../auth/useAuth'
import { findById, updateUser } from '../auth/userDirectory'

function PhoneFormContent({
  userId,
  refreshSession,
}: {
  userId: string
  refreshSession: () => void | Promise<void>
}) {
  const [phone, setPhone] = useState(() => findById(userId)?.phone ?? '')
  const [saved, setSaved] = useState(false)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = phone.trim()
    if (!trimmed) return
    const result = updateUser(userId, { phone: trimmed })
    if (!result.ok) return
    setSaved(true)
    void refreshSession()
  }

  return (
    <>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div>
          <label
            htmlFor="phone"
            className="mb-1.5 block text-sm font-medium text-stone-700"
          >
            Phone number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value)
              setSaved(false)
            }}
            className={authInputClassName}
            placeholder="+243 …"
          />
        </div>
        {saved ? (
          <p className="text-sm text-emerald-700" role="status">
            Saved.
          </p>
        ) : null}
        <button
          type="submit"
          className="w-full rounded-lg bg-gradient-to-b from-amber-500 to-amber-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2"
        >
          Save phone number
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-stone-500">
        <Link
          to="/home"
          className="font-medium text-amber-800 underline-offset-4 hover:underline"
        >
          Back to wallet
        </Link>
      </p>
    </>
  )
}

export function PhonePage() {
  const { user, refreshSession } = useAuth()

  return (
    <div className="font-dream-sans -mx-6 -mt-2 text-left">
      <h1 className="font-dream-serif text-xl font-semibold text-stone-900">
        Add phone number
      </h1>
      <p className="mt-1 text-sm text-stone-500">
        This number can be used when you make a payment (saved in your member
        profile on this device until the backend is connected).
      </p>

      {user?.id ? (
        <PhoneFormContent userId={user.id} refreshSession={refreshSession} />
      ) : (
        <p className="mt-6 text-sm text-stone-600">
          <Link
            to="/login"
            className="font-medium text-amber-800 underline-offset-4 hover:underline"
          >
            Sign in
          </Link>{' '}
          to manage your phone number.
        </p>
      )}
    </div>
  )
}
