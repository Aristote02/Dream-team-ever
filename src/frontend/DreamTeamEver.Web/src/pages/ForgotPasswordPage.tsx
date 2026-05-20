import { useEffect, useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { forgotPasswordRequest, resetPasswordRequest } from "../api/authApi";
import { AuthShell } from '../components/AuthShell'

type ResetValues = {
  email: string
  newPassword: string
  confirmPassword: string
}

type ResetFieldErrors = Partial<Record<keyof ResetValues, string>>

function validateReset(
  values: ResetValues,
  t: (key: TranslationKey, params?: Record<string, string | number>) => string,
): ResetFieldErrors {
  const errors: ResetFieldErrors = {}
  const mail = values.email.trim()

  if (!mail) {
    errors.email = t('validation.emailRequired')
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
    errors.email = t('validation.emailInvalid')
  }

  if (!values.newPassword) {
    errors.newPassword = t('validation.newPasswordRequired')
  } else if (values.newPassword.length < 6) {
    errors.newPassword = t('validation.passwordMin')
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = t('validation.confirmRequired')
  } else if (values.confirmPassword !== values.newPassword) {
    errors.confirmPassword = t('validation.passwordsMismatch')
  }

  return errors
}

function validateEmailOnly(
  email: string,
  t: (key: TranslationKey, params?: Record<string, string | number>) => string,
): string | undefined {
  const trimmed = email.trim()
  if (!trimmed) return t('validation.emailRequired')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return t('validation.emailInvalid')
  return undefined
}

export function ForgotPasswordPage() {
  const { t } = useLocale()
  const [searchParams] = useSearchParams()
  const tokenFromUrl = searchParams.get('token')?.trim() ?? ''
  const emailFromUrl = searchParams.get('email')?.trim() ?? ''
  const hasResetLink = Boolean(tokenFromUrl && emailFromUrl)

  const [email, setEmail] = useState(emailFromUrl)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<ResetFieldErrors>({})
  const [requestError, setRequestError] = useState<string | null>(null)
  const [requestDone, setRequestDone] = useState(false)
  const [resetDone, setResetDone] = useState(false)

  useEffect(() => {
    if (emailFromUrl) setEmail(emailFromUrl)
  }, [emailFromUrl])

  const forgotMutation = useMutation({
    mutationFn: async (mail: string) => {
      const result = await forgotPasswordRequest(mail)
      if (!result.ok) {
        throw new Error(result.message ?? t('forgot.requestFailed'))
      }
    },
    onSuccess: () => {
      setRequestDone(true)
    },
  })

  const resetMutation = useMutation({
    mutationFn: async (payload: { mail: string; code: string; password: string }) => {
      const result = await resetPasswordRequest(payload.mail, payload.code, payload.password)
      if (!result.ok) {
        throw new Error(result.message ?? t('forgot.resetFailed'))
      }
    },
    onSuccess: () => {
      setResetDone(true)
      setNewPassword('')
      setConfirmPassword('')
    },
  })

  async function onRequestReset(e: FormEvent) {
    e.preventDefault()
    setRequestError(null)
    setResetDone(false)
    setRequestDone(false)

    const emailError = validateEmailOnly(email, t)
    if (emailError) {
      setFieldErrors({ email: emailError })
      return
    }

    try {
      await forgotMutation.mutateAsync(email)
    } catch (err) {
      setRequestError(err instanceof Error ? err.message : t('forgot.requestFailed'))
    }
  }

  async function onResetPassword(e: FormEvent) {
    e.preventDefault()
    setRequestError(null)
    setResetDone(false)

    if (!tokenFromUrl) {
      setRequestError(t('forgot.invalidLink'))
      return
    }

    const nextErrors = validateReset({ email, newPassword, confirmPassword }, t)
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    try {
      await resetMutation.mutateAsync({
        mail: email,
        code: tokenFromUrl,
        password: newPassword,
      })
    } catch (err) {
      setRequestError(err instanceof Error ? err.message : t('forgot.resetFailed'))
    }
  }

  const title = hasResetLink ? t('forgot.resetPassword') : t('forgot.title')
  const lead = hasResetLink ? t('forgot.setPasswordFor', { email }) : t('forgot.lead')

  return (
    <AuthShell title={t('auth.forgotTitle')} subtitle={t('forgot.subtitle')}>
      <div className="space-y-6">
        {!hasResetLink ? (
          <form className="space-y-4 sm:space-y-5" onSubmit={onRequestReset} noValidate>
            <div>
              <label htmlFor="forgot-email" className="mb-1.5 block text-left text-sm font-medium text-stone-700 dark:text-stone-300">
                {t("common.email")}
              </label>
              <input
                id="forgot-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }))
                }}
                className="auth-field"
                placeholder={t("register.emailPlaceholder")}
                required
              />
            </AuthFormField>

            <button type="submit" disabled={forgotMutation.isPending} className={authPrimaryButtonClassName}>
              {forgotMutation.isPending ? t('forgot.requesting') : t('forgot.requestEmail')}
            </button>
          </form>
        ) : null}

      {requestDone && !hasResetLink ? (
        <p className="auth-alert auth-alert-success mt-4" role="status">
          {t('forgot.emailSent')}
        </p>
      ) : null}

      {hasResetLink ? (
          <form className="auth-form" onSubmit={onResetPassword} noValidate>
            <AuthFormField
              id="reset-new-password"
              label={t('common.newPassword')}
              error={fieldErrors.newPassword}
            >
              <input
                id="reset-new-password"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value)
                  if (fieldErrors.newPassword) {
                    setFieldErrors((prev) => ({ ...prev, newPassword: undefined }))
                  }
                }}
                className="auth-field"
                placeholder={t("forgot.passwordPlaceholder")}
                required
              />
            </AuthFormField>

            <AuthFormField
              id="reset-confirm-password"
              label={t('common.confirmPassword')}
              error={fieldErrors.confirmPassword}
            >
              <input
                id="reset-confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  if (fieldErrors.confirmPassword) {
                    setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }))
                  }
                }}
                className="auth-field"
                placeholder={t("forgot.passwordPlaceholder")}
                required
              />
            </AuthFormField>

            <button type="submit" disabled={resetMutation.isPending} className={authPrimaryButtonClassName}>
              {resetMutation.isPending ? t('forgot.resetting') : t('forgot.resetPassword')}
            </button>
          </form>
        ) : null}

      {requestError ? (
        <p className="auth-alert auth-alert-error mt-4" role="alert">
          {requestError}
        </p>
      </div>
    </AuthShell>
  );
}
