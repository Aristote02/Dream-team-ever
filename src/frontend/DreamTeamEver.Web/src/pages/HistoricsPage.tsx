import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { fetchMyPayments, type PaymentTransactionDto } from '../api/authApi'
import { useAuth } from '../auth/useAuth'
import { useLocale } from '../i18n/LocaleProvider'
import { paymentStatusLabel } from '../i18n/paymentStatusLabel'

function formatAmount(amount: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
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
    <div className="font-dream-sans -mx-6 -mt-2 text-left">
      <h1 className="font-dream-serif text-xl font-semibold text-stone-900 dark:text-white">
        {t('historics.title')}
      </h1>
      <p className="mt-1 text-sm text-stone-500">
        {t('historics.lead')}
      </p>

      {loading ? (
        <p className="mt-6 text-sm text-stone-500">{t('historics.loading')}</p>
      ) : error ? (
        <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 ring-1 ring-red-200/80 dark:bg-red-950/30 dark:text-red-200 dark:ring-red-900/40">
          {error}
        </p>
      ) : hasRows ? (
        <ul className="mt-6 space-y-3">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-800 p-4 text-white shadow-lg ring-1 ring-amber-400/30"
            >
              <div>
                <p className="font-medium text-white">
                  {t('historics.paymentLine', { method: row.method })}
                </p>
                <p className="text-xs text-amber-100/90">
                  {new Date(row.createdAt).toLocaleDateString(locale)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-white">
                  {formatAmount(row.amount, row.currency, locale)}
                </p>
                <p
                  className={
                    row.status === 'Pending'
                      ? 'text-xs font-medium text-amber-100'
                      : row.status === 'Completed'
                        ? 'text-xs text-emerald-200'
                        : 'text-xs text-rose-200'
                  }
                >
                  {paymentStatusLabel(t, row.status)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-sm text-stone-500">
          {t('historics.empty')}
        </p>
      )}

      <p className="mt-8 text-center text-sm text-stone-500">
        <Link
          to="/home"
          className="font-medium text-amber-800 underline-offset-4 hover:underline dark:text-amber-300"
        >
          {t('common.backToWallet')}
        </Link>
      </p>
    </div>
  )
}
