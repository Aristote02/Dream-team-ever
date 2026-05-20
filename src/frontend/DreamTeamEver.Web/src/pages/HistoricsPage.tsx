import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { fetchMyPayments, type PaymentTransactionDto } from '../api/authApi'
import { paymentTypeLabel } from '../i18n/paymentTypeLabel'
import { useAuth } from '../auth/useAuth'
import { useLocale } from '../i18n/LocaleProvider'
import { paymentStatusLabel } from '../i18n/paymentStatusLabel'
import type { PaymentStatus } from '../types/payment'
import './historics-page.css'

function formatAmount(amount: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

function statusClass(status: PaymentStatus): string {
  switch (status) {
    case 'Completed':
      return 'historics-item-status--completed'
    case 'Pending':
      return 'historics-item-status--pending'
    case 'Failed':
      return 'historics-item-status--failed'
    case 'Cancelled':
      return 'historics-item-status--cancelled'
    default:
      return ''
  }
}

export function HistoricsPage() {
  const { user, getAccessToken } = useAuth()
  const { locale, t } = useLocale()
  const query = useQuery<PaymentTransactionDto[], Error>({
    queryKey: ['member', 'payments', user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const token = await getAccessToken()
      if (!token) throw new Error(t('errors.sessionExpired'))
      const result = await fetchMyPayments(token)
      if (!result.ok) throw new Error(t('historics.loadFailed'))
      return result.data
    },
  })

  const rows = query.data ?? []
  const loading = query.isLoading
  const error = query.error?.message ?? null
  const hasRows = useMemo(() => rows.length > 0, [rows.length])

  return (
    <div className="historics-page">
      <header className="historics-header">
        <h1 className="historics-title">{t('historics.title')}</h1>
        <p className="historics-lead">{t('historics.lead')}</p>
      </header>

      <section className="historics-panel" aria-labelledby="historics-panel-title">
        <h2 id="historics-panel-title" className="sr-only">
          {t('historics.title')}
        </h2>

        <div className="historics-panel-body">
          {loading ? (
            <p className="historics-loading">{t('historics.loading')}</p>
          ) : error ? (
            <p className="historics-error" role="alert">
              {error}
            </p>
          ) : hasRows ? (
            <ul className="historics-list">
              {rows.map((row) => (
                <li key={row.id} className="historics-item">
                  <div className="historics-item-main">
                    <p className="historics-item-type">
                      {paymentTypeLabel(t, row.paymentType)}
                    </p>
                    <p className="historics-item-meta">
                      {new Date(row.createdAt).toLocaleDateString(locale, {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}{' '}
                      · {row.method}
                    </p>
                  </div>
                  <div className="historics-item-side">
                    <p className="historics-item-amount">
                      {formatAmount(row.amount, row.currency, locale)}
                    </p>
                    <span
                      className={`historics-item-status ${statusClass(row.status)}`}
                    >
                      {paymentStatusLabel(t, row.status)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="historics-empty">{t('historics.empty')}</p>
          )}
        </div>

        <footer className="historics-panel-footer">
          <Link to="/home">{t('common.backToWallet')}</Link>
        </footer>
      </section>
    </div>
  )
}
