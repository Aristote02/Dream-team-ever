import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import {
  authInputClassName,
  authLinkClassName,
  authPrimaryButtonClassName,
} from '../components/authInputClass'
import { AuthFormField } from '../components/auth/AuthFormField'
import { AuthScreenLayout } from '../components/AuthScreenLayout'
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

  if (!authReady) {
    return (
      <AuthScreenLayout title={t('login.title')} lead={t('login.lead')}>
        <p className="auth-screen-lead">{t('common.loading')}</p>
      </AuthScreenLayout>
    )
  }

  return (
    <AuthScreenLayout
      title={t('login.title')}
      lead={t('login.lead')}
      footer={
        <>
          {t('login.noAccount')}{' '}
          <Link to="/register" className={authLinkClassName}>
            {t('common.createAccount')}
          </Link>
        </>
      }
    >
      {registeredNotice ? (
        <p className="auth-alert auth-alert-success mb-4" role="status">
          {t('login.accountCreated')}
        </p>
      ) : null}

      <form className="auth-form" onSubmit={onSubmit} noValidate>
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
            placeholder={t('register.emailPlaceholder')}
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
            placeholder={t('forgot.passwordPlaceholder')}
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
    </AuthScreenLayout>
  )
}
