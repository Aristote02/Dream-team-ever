import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchCurrentMember, updateMyProfileRequest } from '../api/authApi'
import { useAuth } from '../auth/useAuth'
import { useLocale } from '../i18n/LocaleProvider'
import './profile-page.css'

type MemberView = {
  fullName: string
  phone: string
  matriculeCode: string | null
  matriculeIssuedAt: string | null
  createdAt: string
}

export function ViewPage() {
  const { user, getAccessToken, refreshSession } = useAuth()
  const { t } = useLocale()
  const queryClient = useQueryClient()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const profileQuery = useQuery<MemberView, Error>({
    queryKey: ['member', 'profile', user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const token = await getAccessToken()
      if (!token) {
        throw new Error(t('errors.sessionExpired'))
      }
      const me = await fetchCurrentMember(token)
      if (!me.ok) throw new Error(t('view.loadFailed'))
      return me.data
    },
  })

  useEffect(() => {
    const profile = profileQuery.data
    if (!profile) return
    setFullName(profile.fullName)
    setPhone(profile.phone)
  }, [profileQuery.data])

  const updateMutation = useMutation({
    mutationFn: async ({ nextFullName, nextPhone }: { nextFullName: string; nextPhone: string }) => {
      const token = await getAccessToken()
      if (!token) throw new Error(t('errors.sessionExpired'))
      const updated = await updateMyProfileRequest(token, nextFullName, nextPhone)
      if (!updated.ok) throw new Error(updated.message ?? t('view.saveFailed'))
      return updated.data
    },
    onSuccess: async (updatedProfile) => {
      queryClient.setQueryData(['member', 'profile', user?.id], updatedProfile)
      setSaved(true)
      await refreshSession()
    },
  })

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSaved(false)

    if (!fullName.trim() || !phone.trim()) {
      setError(t('validation.fullNamePhoneRequired'))
      return
    }

    try {
      await updateMutation.mutateAsync({ nextFullName: fullName, nextPhone: phone })
    } catch (err) {
      setError(err instanceof Error ? err.message : t('view.saveFailed'))
    }
  }

  const model = profileQuery.data ?? null
  const loading = profileQuery.isLoading
  const saving = updateMutation.isPending
  const queryError = profileQuery.error instanceof Error ? profileQuery.error.message : null
  const effectiveError = error ?? queryError
  const dash = t('common.dash')

  return (
    <div className="view-page">
      <header className="view-page-header">
        <h1 className="view-page-title">{t('view.title')}</h1>
        <p className="view-page-lead">{t('view.lead')}</p>
      </header>

      {!user ? (
        <p className="view-page-muted">
          <Link to="/login">{t('common.signIn')}</Link> {t('view.signInToManage')}
        </p>
      ) : loading ? (
        <p className="view-page-muted">{t('view.loading')}</p>
      ) : (
        <div className="view-page-card">
          <form className="view-page-form" onSubmit={onSubmit} noValidate>
            <div className="view-field">
              <label htmlFor="full-name" className="view-label">
                {t('common.fullName')}
              </label>
              <input
                id="full-name"
                name="fullName"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value)
                  setSaved(false)
                }}
                className="view-input"
                placeholder={t('view.fullNamePlaceholder')}
              />
            </div>

            <div className="view-field">
              <label htmlFor="phone" className="view-label">
                {t('common.phone')}
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
                className="view-input"
                placeholder={t('view.phonePlaceholder')}
              />
            </div>

            <div className="view-field">
              <label htmlFor="email" className="view-label">
                {t('common.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={user.email ?? dash}
                readOnly
                className="view-input"
                aria-readonly="true"
              />
            </div>

            <div className="view-field">
              <label htmlFor="matricule" className="view-label">
                {t('view.matriculeCode')}
              </label>
              <input
                id="matricule"
                name="matricule"
                value={model?.matriculeCode ?? dash}
                readOnly
                className="view-input"
                aria-readonly="true"
              />
            </div>

            {effectiveError ? (
              <p className="view-alert view-alert-error" role="alert">
                {effectiveError}
              </p>
            ) : null}
            {saved ? (
              <p className="view-alert view-alert-success" role="status">
                {t('view.updated')}
              </p>
            ) : null}

            <button type="submit" disabled={saving} className="view-btn-primary">
              {saving ? t('view.saving') : t('view.saveChanges')}
            </button>
          </form>

          <p className="view-page-card-footer">{t('view.cardTag')}</p>
        </div>
      )}

      {user && !loading ? (
        <p className="view-page-back">
          <Link to="/home">{t('common.backToWallet')}</Link>
        </p>
      ) : null}
    </div>
  )
}
