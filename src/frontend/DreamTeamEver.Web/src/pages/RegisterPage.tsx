import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthFormField } from '../components/auth/AuthFormField'
import { AuthShell } from '../components/AuthShell'
import {
  authInputClassName,
  authLinkClassName,
  authPrimaryButtonClassName,
} from '../components/authInputClass'
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
        navigate('/login', {
          replace: true,
          state: { email: email.trim(), registered: true },
        })
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

  const shellProps = {
    title: t('auth.signUpTitle'),
    subtitle: t('register.lead'),
    footer: (
      <>
        {t('register.alreadyHaveAccount')}{' '}
        <Link to="/login" className={authLinkClassName}>
          {t('common.signIn')}
        </Link>
      </>
    ),
  }

  if (!authReady) {
    return (
      <AuthShell {...shellProps}>
        <p className="auth-screen-lead">{t('common.loading')}</p>
      </AuthShell>
    )
  }

  return (
    <AuthShell {...shellProps}>
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        <AuthFormField
          id="register-name"
          label={t('common.fullName')}
          error={fieldErrors.displayName}
        >
          <input
            id="register-name"
            name="displayName"
            type="text"
            autoComplete="name"
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value)
              if (fieldErrors.displayName) {
                setFieldErrors((prev) => ({ ...prev, displayName: undefined }))
              }
            }}
            className={authInputClassName}
            placeholder={t('register.yourName')}
            required
          />
        </AuthFormField>

        <AuthFormField id="register-email" label={t('common.email')} error={fieldErrors.email}>
          <input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }))
            }}
            className={authInputClassName}
            placeholder={t('register.emailPlaceholder')}
            required
          />
        </AuthFormField>

        <AuthFormField id="register-phone" label={t('common.phone')} error={fieldErrors.phone}>
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
              if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: undefined }))
            }}
            className={authInputClassName}
            placeholder={t('register.phonePlaceholder')}
            required
            minLength={6}
            maxLength={32}
            pattern="[0-9]*"
          />
        </AuthFormField>

        <AuthFormField id="register-password" label={t('common.password')} error={fieldErrors.password}>
          <input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (fieldErrors.password || fieldErrors.confirm) {
                setFieldErrors((prev) => ({
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
        </AuthFormField>

        <AuthFormField
          id="register-confirm"
          label={t('common.confirmPassword')}
          error={fieldErrors.confirm}
        >
          <input
            id="register-confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value)
              if (fieldErrors.confirm) setFieldErrors((prev) => ({ ...prev, confirm: undefined }))
            }}
            className={authInputClassName}
            placeholder={t('register.repeatPassword')}
            required
          />
        </AuthFormField>

        {error ? (
          <p className="auth-alert auth-alert-error" role="alert">
            {error}
          </p>
        ) : null}

        <button type="submit" disabled={submitting} className={authPrimaryButtonClassName}>
          {submitting ? t('register.creating') : t('common.createAccount')}
        </button>
      </form>
    </AuthShell>
  )
}
