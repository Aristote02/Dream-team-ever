import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { fetchMyPayments, type PaymentTransactionDto } from '../api/authApi'
import { useAuth } from '../auth/useAuth'

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function HistoricsPage() {
  const { user, getAccessToken } = useAuth()
  const query = useQuery<PaymentTransactionDto[], Error>({
    queryKey: ['member', 'payments', user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const token = await getAccessToken()
      if (!token) throw new Error('Session expired. Please sign in again.')
      const result = await fetchMyPayments(token)
      if (!result.ok) throw new Error('Could not load your payment historics.')
      return result.data
    },
  })

  const rows = query.data ?? []
  const loading = query.isLoading
  const error = query.error?.message ?? null

  const hasRows = useMemo(() => rows.length > 0, [rows.length])

  return (
    <div className="font-dream-sans -mx-6 -mt-2 text-left">
      <h1 className="font-dream-serif text-xl font-semibold text-stone-900">
        Payment historics
      </h1>
      <p className="mt-1 text-sm text-stone-500">
        Overview of your transactions.
      </p>

      {loading ? (
        <p className="mt-6 text-sm text-stone-500">Loading payment historics…</p>
      ) : error ? (
        <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 ring-1 ring-red-200/80">
          {error}
        </p>
      ) : hasRows ? (
        <ul className="mt-6 space-y-3">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-stone-200/80 bg-white p-4 shadow-sm ring-1 ring-stone-100"
            >
              <div>
                <p className="font-medium text-stone-900">
                  {row.method} payment
                </p>
                <p className="text-xs text-stone-500">
                  {new Date(row.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-stone-800">
                  {formatAmount(row.amount, row.currency)}
                </p>
                <p
                  className={
                    row.status === 'Pending'
                      ? 'text-xs font-medium text-amber-700'
                      : row.status === 'Completed'
                        ? 'text-xs text-emerald-700'
                        : 'text-xs text-rose-700'
                  }
                >
                  {row.status}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-sm text-stone-500">
          No payments yet for this member.
        </p>
      )}

      <p className="mt-8 text-center text-sm text-stone-500">
        <Link
          to="/home"
          className="font-medium text-amber-800 underline-offset-4 hover:underline"
        >
          Back to wallet
        </Link>
      </p>
    </div>
  )
}
