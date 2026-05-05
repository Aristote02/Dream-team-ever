import { Link } from 'react-router-dom'

/** Static demo rows until payment API exists. */
const STATIC_PAYMENTS = [
  {
    id: '1',
    label: 'Registration fee',
    date: '2025-04-28',
    amount: '$14.95',
    status: 'Completed',
  },
  {
    id: '2',
    label: 'Membership renewal',
    date: '2025-03-15',
    amount: '$12.00',
    status: 'Completed',
  },
  {
    id: '3',
    label: 'Event deposit',
    date: '2025-02-02',
    amount: '$8.50',
    status: 'Pending',
  },
] as const

export function HistoricsPage() {
  return (
    <div className="font-dream-sans -mx-6 -mt-2 text-left">
      <h1 className="font-dream-serif text-xl font-semibold text-stone-900">
        Payment historics
      </h1>
      <p className="mt-1 text-sm text-stone-500">
        Overview of your transactions (demo data).
      </p>

      <ul className="mt-6 space-y-3">
        {STATIC_PAYMENTS.map((row) => (
          <li
            key={row.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-stone-200/80 bg-white p-4 shadow-sm ring-1 ring-stone-100"
          >
            <div>
              <p className="font-medium text-stone-900">{row.label}</p>
              <p className="text-xs text-stone-500">{row.date}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-stone-800">{row.amount}</p>
              <p
                className={
                  row.status === 'Pending'
                    ? 'text-xs font-medium text-amber-700'
                    : 'text-xs text-emerald-700'
                }
              >
                {row.status}
              </p>
            </div>
          </li>
        ))}
      </ul>

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
