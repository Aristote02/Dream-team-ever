import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authInputClassName } from '../components/authInputClass'
import { AuthScreenLayout } from '../components/AuthScreenLayout'
import { useAuth } from '../auth/useAuth'

import { useLocale } from '../i18n/LocaleProvider'
import type { TranslationKey } from '../i18n/translations'
type RegisterValues = {
  displayName: string
  email: string
  phone: string
  password: string
  confirm: string
}

type RegisterFieldErrors = Partial<Record<keyof RegisterValues, string>>

function validateRegister(
  values: RegisterValues,
  t: (key: TranslationKey, params?: Record<string, string | number>) => string,
): RegisterFieldErrors {
  const errors: RegisterFieldErrors = {}
  const name = values.displayName.trim()
  const mail = values.email.trim()
  const tel = values.phone.trim()

  if (name.length < 2 || name.length > 200) {
    errors.displayName = t('validation.fullNameLength')
  }

  if (!mail) {
    errors.email = t('validation.emailRequired')
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
    errors.email = t('validation.emailInvalid')
  }

  if (!tel) {
    errors.phone = t('validation.phoneRequired')
  } else if (!/^\d+$/.test(tel)) {
    errors.phone = t('validation.phoneDigitsOnly')
  } else if (tel.length < 6 || tel.length > 32) {
    errors.phone = t('validation.phoneLength')
  }

  if (!values.password) {
    errors.password = t('validation.passwordRequired')
  } else if (values.password.length < 6) {
    errors.password = t('validation.passwordMin')
  }

  if (!values.confirm) {
    errors.confirm = t('validation.confirmRequired')
  } else if (values.password !== values.confirm) {
    errors.confirm = t('validation.passwordsMismatch')
  }

  return errors
}

export function RegisterPage() {
  const navigate = useNavigate()
  const { user, register, authReady } = useAuth()
  const { t } = useLocale()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (authReady && user) navigate('/home', { replace: true })
  }, [user, authReady, navigate])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const values: RegisterValues = { displayName, email, phone, password, confirm }
    const nextErrors = validateRegister(values, t)
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setSubmitting(true)
    try {
      const result = await register(displayName, email, phone, password)
      if (result === 'ok') {
        navigate('/home', { replace: true })
      } else if (result === 'email-taken') {
        setError(t('register.emailTaken'))
      } else if (result === 'invalid') {
        setError(t('register.fillAllFields'))
      } else {
        setError(t('errors.serverUnreachable'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (!authReady) {
    return (
      <AuthScreenLayout subtitle={t('register.subtitle')}>
        <p className="text-center text-sm text-stone-500">{t('common.loading')}</p>
      </AuthScreenLayout>
    )
  }

  return (
    <AuthScreenLayout subtitle={t('register.subtitle')}>
      <form className="space-y-4 sm:space-y-5" onSubmit={onSubmit} noValidate>
        <div>
          <label
            htmlFor="register-name"
            className="mb-1.5 block text-left text-sm font-medium text-stone-700 dark:text-stone-300"
          >
            {t('common.fullName')}
          </label>
          <input
            id="register-name"
            name="displayName"
            type="text"
            autoComplete="name"
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value)
              if (fieldErrors.displayName) {
                setFieldErrors(prev => ({ ...prev, displayName: undefined }))
              }
            }}
            className={authInputClassName}
            placeholder={t('register.yourName')}
            required
          />
          {fieldErrors.displayName ? (
            <p className="mt-1 text-xs text-red-700">{fieldErrors.displayName}</p>
          ) : null}
        </div>
        <div>
          <label
            htmlFor="register-email"
            className="mb-1.5 block text-left text-sm font-medium text-stone-700 dark:text-stone-300"
          >
            {t('common.email')}
          </label>
          <input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (fieldErrors.email) {
                setFieldErrors(prev => ({ ...prev, email: undefined }))
              }
            }}
            className={authInputClassName}
            placeholder={t('register.emailPlaceholder')}
            required
          />
          {fieldErrors.email ? (
            <p className="mt-1 text-xs text-red-700">{fieldErrors.email}</p>
          ) : null}
        </div>
        <div>
          <label
            htmlFor="register-phone"
            className="mb-1.5 block text-left text-sm font-medium text-stone-700 dark:text-stone-300"
          >
            {t('common.phone')}
          </label>
          <input
            id="register-phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            value={phone}
            onChange={(e) => {
              const digitsOnly = e.target.value.replace(/\D/g, '')
              setPhone(digitsOnly)
              if (fieldErrors.phone) {
                setFieldErrors(prev => ({ ...prev, phone: undefined }))
              }
            }}
            className={authInputClassName}
            placeholder={t('register.phonePlaceholder')}
            required
            minLength={6}
            maxLength={32}
            pattern="[0-9]*"
          />
          {fieldErrors.phone ? (
            <p className="mt-1 text-xs text-red-700">{fieldErrors.phone}</p>
          ) : null}
        </div>
        <div>
          <label
            htmlFor="register-password"
            className="mb-1.5 block text-left text-sm font-medium text-stone-700 dark:text-stone-300"
          >
            {t('common.password')}
          </label>
          <input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (fieldErrors.password || fieldErrors.confirm) {
                setFieldErrors(prev => ({
                  ...prev,
                  password: undefined,
                  confirm: undefined,
                }))
              }
            }}
            className={authInputClassName}
            placeholder={t('register.passwordPlaceholder')}
            required

            minLength={6}
          />
          {fieldErrors.password ? (
            <p className="mt-1 text-xs text-red-700">{fieldErrors.password}</p>
          ) : null}
        </div>
        <div>
          <label
            htmlFor="register-confirm"
            className="mb-1.5 block text-left text-sm font-medium text-stone-700 dark:text-stone-300"
          >
            {t('common.confirmPassword')}
          </label>
          <input
            id="register-confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value)
              if (fieldErrors.confirm) {
                setFieldErrors(prev => ({ ...prev, confirm: undefined }))
              }
            }}
            className={authInputClassName}
            placeholder={t('register.repeatPassword')}
            required
          />
          {fieldErrors.confirm ? (
            <p className="mt-1 text-xs text-red-700">{fieldErrors.confirm}</p>
          ) : null}
        </div>

        {error ? (
          <p
            className="rounded-lg bg-red-50 px-3 py-2 text-left text-sm text-red-800 ring-1 ring-red-200/80 dark:bg-red-950/30 dark:text-red-200 dark:ring-red-900/40"
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
          {submitting ? t('register.creating') : t('common.createAccount')}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-stone-500 sm:mt-8">
        {t('register.alreadyHaveAccount')}{' '}
        <Link
          to="/login"
          className="font-medium text-amber-800 underline-offset-4 hover:text-amber-950 hover:underline dark:text-amber-300 dark:hover:text-amber-200"
        >
          {t('common.signIn')}
        </Link>
      </p>
    </AuthScreenLayout>
  )
}
