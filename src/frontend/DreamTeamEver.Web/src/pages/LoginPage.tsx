import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
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

type LoginValues = {
  email: string
  password: string
}

type LoginFieldErrors = Partial<Record<keyof LoginValues, string>>

type LoginLocationState = {
  email?: string
  registered?: boolean
}

function validateLogin(
  values: LoginValues,
  t: (key: TranslationKey) => string,
): LoginFieldErrors {
  const errors: LoginFieldErrors = {}
  const mail = values.email.trim()
  if (!mail) {
    errors.email = t('validation.emailRequired')
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
    errors.email = t('validation.emailInvalid')
  }

  if (!values.password) {
    errors.password = t('validation.passwordRequired')
  } else if (values.password.length < 6) {
    errors.password = t('validation.passwordMin')
  }

  return errors
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, login, authReady } = useAuth()
  const { t } = useLocale()
  const loginState = (location.state as LoginLocationState | null) ?? {}
  const [email, setEmail] = useState(() => loginState.email?.trim() ?? '')
  const [registeredNotice] = useState(() => Boolean(loginState.registered))
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (authReady && user) navigate('/home', { replace: true })
  }, [user, authReady, navigate])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const nextErrors = validateLogin({ email, password }, t)
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    setSubmitting(true)
    try {
      const result = await login(email, password)
      if (result === 'ok') {
        navigate('/home', { replace: true })
      } else if (result === 'invalid') {
        setError(t('errors.invalidCredentials'))
      } else {
        setError(t('errors.serverUnreachable'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  const shellProps = {
    title: t('auth.signInTitle'),
    subtitle: t('login.lead'),
    footer: (
      <>
        {t('login.noAccount')}{' '}
        <Link to="/register" className={authLinkClassName}>
          {t('common.createAccount')}
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
        {registeredNotice ? (
          <p className="auth-alert auth-alert-success" role="status">
            {t('login.accountCreated')}
          </p>
        ) : null}

        <AuthFormField id="login-email" label={t('common.email')} error={fieldErrors.email}>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }))
            }}
            className={authInputClassName}
            placeholder="you@example.com"
            required
          />
        </AuthFormField>

        <AuthFormField id="login-password" label={t('common.password')} error={fieldErrors.password}>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }))
            }}
            className={authInputClassName}
            placeholder="••••••••"
            required
          />
        </AuthFormField>

        <p className="auth-link-row">
          <Link to="/forgot-password" className={authLinkClassName}>
            {t('login.forgotPassword')}
          </Link>
        </p>

        {error ? (
          <p className="auth-alert auth-alert-error" role="alert">
            {error}
          </p>
        ) : null}

        <button type="submit" disabled={submitting} className={authPrimaryButtonClassName}>
          {submitting ? t('login.signingIn') : t('common.signIn')}
        </button>
      </form>
    </AuthShell>
  )
}
