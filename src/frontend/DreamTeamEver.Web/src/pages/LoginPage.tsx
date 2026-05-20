import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { AuthShell } from '../components/AuthShell'
import { useLocale } from "../i18n/LocaleProvider";
import type { TranslationKey } from "../i18n/translations";

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
      <AuthShell title={t('auth.signInTitle')} subtitle={t('login.subtitle')}>
        <p className="text-center text-sm text-muted-foreground">{t('common.loading')}</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={t('auth.signInTitle')} subtitle={t('login.subtitle')}>
      <form className="space-y-4 sm:space-y-5 text-left" onSubmit={onSubmit} noValidate>
        <div>
          <label htmlFor="login-email" className="mb-1.5 block text-left text-sm font-medium text-stone-700 dark:text-stone-300">
            {t("common.email")}
          </label>
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
            className="auth-field"
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
            className="auth-field"
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

        <button
          type="submit"
          disabled={submitting}
          className="auth-btn-primary disabled:opacity-60"
        >
          {submitting ? t("login.signingIn") : t("common.signIn")}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-stone-500 sm:mt-8">
        <Link to="/register" className="font-medium text-amber-800 underline-offset-4 hover:text-amber-950 hover:underline dark:text-amber-300 dark:hover:text-amber-200">
          {t("common.createAccount")}
        </Link>
      </p>
    </AuthShell>
  );
}
