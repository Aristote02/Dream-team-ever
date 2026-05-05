import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authInputClassName } from '../components/authInputClass'
import { AuthScreenLayout } from '../components/AuthScreenLayout'
import { useAuth } from '../auth/useAuth'

export function RegisterPage() {
  const navigate = useNavigate()
  const { user, register, authReady } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (authReady && user) navigate('/home', { replace: true })
  }, [user, authReady, navigate])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (phone.trim().length < 6 || phone.trim().length > 32) {
      setError('Phone must be between 6 and 32 characters.')
      return
    }

    setSubmitting(true)
    try {
      const result = await register(displayName, email, phone, password)
      if (result === 'ok') {
        navigate('/home', { replace: true })
      } else if (result === 'email-taken') {
        setError('That email is already registered. Sign in instead.')
      } else if (result === 'invalid') {
        setError('Please fill in all fields.')
      } else {
        setError('Could not reach the server. Is the API running?')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (!authReady) {
    return (
      <AuthScreenLayout subtitle="Join the team. Kinshasa · Estd 2025">
        <p className="text-center text-sm text-stone-500">Loading…</p>
      </AuthScreenLayout>
    )
  }

  return (
    <AuthScreenLayout subtitle="Join the team. Kinshasa · Estd 2025">
      <form className="space-y-4 sm:space-y-5" onSubmit={onSubmit} noValidate>
        <div>
          <label
            htmlFor="register-name"
            className="mb-1.5 block text-left text-sm font-medium text-stone-700 dark:text-stone-300"
          >
            Full name
          </label>
          <input
            id="register-name"
            name="displayName"
            type="text"
            autoComplete="name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className={authInputClassName}
            placeholder="Your name"
            required
          />
        </div>
        <div>
          <label
            htmlFor="register-email"
            className="mb-1.5 block text-left text-sm font-medium text-stone-700 dark:text-stone-300"
          >
            Email
          </label>
          <input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={authInputClassName}
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <label
            htmlFor="register-phone"
            className="mb-1.5 block text-left text-sm font-medium text-stone-700 dark:text-stone-300"
          >
            Phone
          </label>
          <input
            id="register-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={authInputClassName}
            placeholder="+243 …"
            required
            minLength={6}
            maxLength={32}
          />
        </div>
        <div>
          <label
            htmlFor="register-password"
            className="mb-1.5 block text-left text-sm font-medium text-stone-700 dark:text-stone-300"
          >
            Password
          </label>
          <input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={authInputClassName}
            placeholder="At least 6 characters"
            required
            minLength={6}
          />
        </div>
        <div>
          <label
            htmlFor="register-confirm"
            className="mb-1.5 block text-left text-sm font-medium text-stone-700 dark:text-stone-300"
          >
            Confirm password
          </label>
          <input
            id="register-confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={authInputClassName}
            placeholder="Repeat password"
            required
          />
        </div>

        {error ? (
          <p
            className="rounded-lg bg-red-50 px-3 py-2 text-left text-sm text-red-800 ring-1 ring-red-200/80"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-gradient-to-b from-amber-500 to-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2 disabled:opacity-60 sm:py-3"
        >
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-stone-500 sm:mt-8">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-medium text-amber-800 underline-offset-4 hover:text-amber-950 hover:underline dark:text-amber-300 dark:hover:text-amber-200"
        >
          Sign in
        </Link>
      </p>
    </AuthScreenLayout>
  )
}
