import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { findById } from '../auth/userDirectory'

const LOGO = '/brand-logo.png'

export function HomePage() {
  const { user, isAdmin } = useAuth()
  const profile = user?.id ? findById(user.id) : null
  const matriculeDisplay = profile?.matricule?.trim() || '—'
  const phoneDisplay = profile?.phone?.trim() || '—'

  return (
    <div className="font-dream-sans -mx-6 -mt-2 min-h-[calc(100svh-8rem)] max-w-full bg-white px-4 pb-8 pt-2 dark:bg-black sm:mx-0 sm:mt-0 sm:rounded-none">
      <header className="flex items-center py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-amber-200/80 bg-white p-0.5 shadow-sm ring-1 ring-amber-100">
            <img
              src={LOGO}
              alt=""
              className="h-full w-full rounded-full object-contain"
            />
          </div>
          <div className="min-w-0 text-left">
            <p className="font-dream-serif truncate text-base font-semibold text-stone-900 dark:text-white">
              Dream Team Ever
            </p>
            <p className="text-xs text-stone-500">Wallet</p>
          </div>
        </div>
      </header>

      {user ? (
        <p className="mb-4 text-left text-xs text-stone-500">
          Signed in as{' '}
          <span className="font-medium text-stone-700">{user.displayName}</span>
        </p>
      ) : null}

      {/* Stacked cards */}
      <div className="relative mx-auto mb-2 h-[230px] w-full max-w-[340px]">
        <div className="absolute inset-x-0 top-[4.25rem] z-20 flex min-h-[158px] flex-col justify-between rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-800 p-4 text-white shadow-lg ring-1 ring-amber-400/30">
          <div className="flex justify-between text-sm font-medium text-white/95">
            <span>Registration</span>
            <span className="text-white/85">Digital pass</span>
          </div>
          <div className="py-1 text-center">
            <p className="text-[0.65rem] font-medium uppercase tracking-widest text-amber-100/90">
              Matricule
            </p>
            <p className="font-dream-serif mt-1 break-all text-2xl font-semibold tracking-wide sm:text-[1.65rem]">
              {matriculeDisplay}
            </p>
          </div>
          <div className="flex items-center justify-between text-xs text-white/85">
            <span>Status</span>
            <span className="rounded-full bg-white/15 px-2 py-0.5 text-[0.7rem] font-medium">
              Issued after payment
            </span>
          </div>
        </div>
      </div>

      <p className="mx-auto mb-8 max-w-[340px] text-center text-sm text-stone-600 dark:text-stone-300">
        <span className="font-medium text-stone-800 dark:text-white">Phone Number: </span>
        <span className="font-mono text-stone-700">{phoneDisplay}</span>
      </p>

      {/* Bottom actions — Payment & Historics only for students */}
      <div
        className={`mx-auto mt-2 flex max-w-[340px] gap-2 rounded-2xl bg-white p-4 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.08)] ring-1 ring-stone-200/80 dark:bg-stone-950 dark:ring-stone-800 ${
          isAdmin ? 'justify-center' : 'justify-between'
        }`}
      >
        <Link
          to={isAdmin ? '/students' : '/phone'}
          className={
            isAdmin
              ? 'flex min-w-0 flex-col items-center gap-2 text-center'
              : 'flex min-w-0 flex-1 flex-col items-center gap-2 text-center'
          }
        >
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-amber-500 to-amber-600 text-2xl font-light text-white shadow-sm">
            {isAdmin ? (
              <svg
                className="h-7 w-7"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              '+'
            )}
          </span>
          <span className="max-w-[5.5rem] text-[0.7rem] font-medium leading-snug text-stone-600">
            {isAdmin ? 'Students' : 'Add phone number'}
          </span>
        </Link>
        {!isAdmin ? (
          <>
            <Link
              to="/checkout"
              className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-sm">
                <svg
                  className="h-7 w-7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </span>
              <span className="text-[0.7rem] font-medium text-stone-600">
                Payment
              </span>
            </Link>
            <Link
              to="/historics"
              className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-violet-400 to-violet-600 text-white shadow-sm">
                <svg
                  className="h-7 w-7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </span>
              <span className="text-[0.7rem] font-medium text-stone-600">
                Historics
              </span>
            </Link>
          </>
        ) : null}
      </div>
    </div>
  )
}
