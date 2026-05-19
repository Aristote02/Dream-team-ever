import type { ReactNode } from 'react'

type FeatureIconName =
  | 'shield'
  | 'wallet'
  | 'zap'
  | 'globe'
  | 'lock'
  | 'users'

const paths: Record<FeatureIconName, ReactNode> = {
  shield: (
    <>
      <path
        d="M12 2 20 6v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z"
        stroke="currentColor"
        strokeWidth="1.75"
        fill="none"
        strokeLinejoin="round"
      />
      <path
        d="m9 12 2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.75"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  wallet: (
    <>
      <rect x="6" y="2" width="12" height="20" rx="2.5" stroke="currentColor" strokeWidth="1.75" fill="none" />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </>
  ),
  zap: (
    <path
      d="M13 2 8 13h4l-1 9 7-12h-4l-1-8z"
      stroke="currentColor"
      strokeWidth="1.75"
      fill="none"
      strokeLinejoin="round"
    />
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" fill="none" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" stroke="currentColor" strokeWidth="1.75" fill="none" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.75" fill="none" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.75" fill="none" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.75" fill="none" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.75" fill="none" />
      <circle cx="17" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M14 20c.3-2.2 1.8-4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </>
  ),
}

export function FeatureIcon({ name }: { name: FeatureIconName }) {
  return (
    <svg viewBox="0 0 24 24" className="size-5 text-stone-900" aria-hidden>
      {paths[name]}
    </svg>
  )
}
