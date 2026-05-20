import { useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchMyPayments, type PaymentTransactionDto } from '../api/authApi'
import { useAuth } from '../auth/useAuth'
import { useLocale } from '../i18n/LocaleProvider'
import { paymentTypeLabel } from '../i18n/paymentTypeLabel'
import { paymentStatusLabel } from '../i18n/paymentStatusLabel'
import './home-dashboard.css'

const RECENT_LIMIT = 5

function formatMemberSince(iso: string | null, locale: string): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(locale, { month: 'short', year: 'numeric' }).toUpperCase()
}

function formatMoney(amount: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

function ProfileIcon() {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  )
}

function PaymentIcon() {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v14a2 2 0 002 2z"
      />
    </svg>
  )
}

function HistoricsIcon() {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

export function HomePage() {
  const navigate = useNavigate()
  const { user, isAdmin, refreshSession, getAccessToken } = useAuth()
  const { locale, t } = useLocale()

  useEffect(() => {
    if (!isAdmin) void refreshSession()
  }, [isAdmin, refreshSession])

  useEffect(() => {
    if (isAdmin) navigate('/students', { replace: true })
  }, [isAdmin, navigate])

  const paymentsQuery = useQuery<PaymentTransactionDto[], Error>({
    queryKey: ['member', 'payments', 'home', user?.id],
    enabled: Boolean(user?.id) && !isAdmin,
    queryFn: async () => {
      const token = await getAccessToken()
      if (!token) throw new Error(t('errors.sessionExpired'))
      const result = await fetchMyPayments(token)
      if (!result.ok) throw new Error(t('historics.loadFailed'))
      return result.data
    },
  })

  const recentPayments = useMemo(
    () => (paymentsQuery.data ?? []).slice(0, RECENT_LIMIT),
    [paymentsQuery.data],
  )

  const matriculeDisplay = user?.matriculeCode?.trim() || t('common.dash')
  const showMatricule = user?.scolarFeeActive || Boolean(user?.matriculeCode?.trim())

  const statusLabel = useMemo(() => {
    if (!user || user.role !== 'student') return t('home.issuedAfterPayment')
    if (user.scolarFeeActive) {
      if (user.scolarFeeExpiresAt) {
        const date = new Date(user.scolarFeeExpiresAt).toLocaleDateString(locale)
        return t('home.expiresOn', { date })
      }
      return t('home.statusActive')
    }
    if (user.nextPaymentType === 'Registration') return t('home.statusPayRegistration')
    if (user.nextPaymentType === 'ScolarFee') {
      return user.matriculeCode ? t('home.statusRenewScolar') : t('home.statusPayScolar')
    }
    return t('home.issuedAfterPayment')
  }, [user, locale, t])

  const memberSince = formatMemberSince(user?.createdAt ?? null, locale)

  if (isAdmin) {
    return (
      <div className="font-dream-sans flex min-h-[40vh] items-center justify-center text-sm text-stone-500 dark:text-stone-300">
        {t('home.redirecting')}
      </div>
    )
  }

  return (
    <div className="home-dashboard">
      <div className="home-dashboard-glow" aria-hidden />

      <div className="home-dashboard-grid">
        <section>
          <p className="home-welcome-label">{t('home.welcomeBack')}</p>
          <h1 className="home-welcome-name">{user?.displayName ?? t('common.dash')}</h1>
          <p className="home-welcome-lead">{t('home.credentialLead')}</p>

          <div className="home-membership-wrap">
            <article className="home-membership-card">
              <div className="home-card-top">
                <div>
                  <p className="home-card-label">{t('home.memberName')}</p>
                  <p className="home-card-value">{user?.displayName ?? t('common.dash')}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="home-card-meta">{t('home.kinshasaYear')}</p>
                  <div className="home-card-logo">
                    <img src="/brand-logo-dark.png" alt="" className="h-7 w-auto object-contain" />
                  </div>
                </div>
              </div>

              <div className="home-card-matricule-block">
                <p className="home-card-label">{t('home.matricule')}</p>
                <p className="home-card-matricule-value">
                  {showMatricule ? matriculeDisplay : t('common.dash')}
                </p>
              </div>

              <div className="home-card-footer">
                <div>
                  <p className="home-card-label">{t('home.memberSince')}</p>
                  <p className="home-card-status">{memberSince}</p>
                </div>
                <div className="text-right">
                  <p className="home-card-label">{t('home.status')}</p>
                  <p className="home-card-status">{statusLabel}</p>
                </div>
              </div>
            </article>
          </div>

          <nav className="home-quick-actions" aria-label={t('home.wallet')}>
            <Link to="/phone" className="home-quick-action">
              <span className="home-quick-action-icon home-quick-action-icon--profile">
                <ProfileIcon />
              </span>
              <span className="home-quick-action-label">{t('home.view')}</span>
            </Link>
            <Link to="/checkout" className="home-quick-action">
              <span className="home-quick-action-icon home-quick-action-icon--payment">
                <PaymentIcon />
              </span>
              <span className="home-quick-action-label">{t('home.payment')}</span>
            </Link>
            <Link to="/historics" className="home-quick-action">
              <span className="home-quick-action-icon home-quick-action-icon--historics">
                <HistoricsIcon />
              </span>
              <span className="home-quick-action-label">{t('home.historics')}</span>
            </Link>
          </nav>
        </section>

        <aside className="home-activity-panel">
          <h2 className="home-activity-title">{t('home.recentActivity')}</h2>
          <p className="home-activity-lead">{t('home.credentialLead')}</p>

          {paymentsQuery.isLoading ? (
            <p className="home-activity-loading">{t('home.activityLoading')}</p>
          ) : recentPayments.length === 0 ? (
            <p className="home-activity-empty">{t('home.noRecentActivity')}</p>
          ) : (
            <ul className="home-activity-list">
              {recentPayments.map((row) => (
                <li key={row.id} className="home-activity-item">
                  <div>
                    <p className="home-activity-item-type">
                      {paymentTypeLabel(t, row.paymentType)}
                    </p>
                    <p className="home-activity-item-meta">
                      {new Date(row.createdAt).toLocaleDateString(locale)} ·{' '}
                      {paymentStatusLabel(t, row.status)}
                    </p>
                  </div>
                  <p className="home-activity-item-amount">
                    {formatMoney(row.amount, row.currency, locale)}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <div className="home-activity-footer">
            <Link to="/historics" className="home-activity-link">
              {t('home.viewFullHistorics')} →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
