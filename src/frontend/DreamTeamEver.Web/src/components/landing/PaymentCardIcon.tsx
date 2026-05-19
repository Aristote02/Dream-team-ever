export function PaymentCardIcon({ className = 'size-6 text-amber-400' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <rect x="2" y="5" width="20" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.75" />
      <path d="M2 10h20" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  )
}
