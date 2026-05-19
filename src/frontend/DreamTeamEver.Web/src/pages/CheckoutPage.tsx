import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchCurrentMember, fetchMyPayments } from '../api/authApi'
import { confirmPayment, fetchRegistrationConfig, initiatePayment } from '../api/paymentApi'
import { useAuth } from '../auth/useAuth'
import { useLocale } from '../i18n/LocaleProvider'
import { paymentTypeLabel } from '../i18n/paymentTypeLabel'
import type { PaymentMethod, PaymentTransactionDto } from '../types/payment'
import './Pages.css'

function formatMoney(amount: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function CheckoutPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { getAccessToken, refreshSession } = useAuth()
  const { locale, t } = useLocale()
  const [method, setMethod] = useState<PaymentMethod>('Mpesa')
  const [pendingTx, setPendingTx] = useState<PaymentTransactionDto | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const configQuery = useQuery({
    queryKey: ['config', 'registration'],
    queryFn: async () => {
      const result = await fetchRegistrationConfig()
      if (!result.ok) throw new Error(t('checkout.configFailed'))
      return result.data
    },
  })

  const memberQuery = useQuery({
    queryKey: ['member', 'me', 'checkout'],
    queryFn: async () => {
      const token = await getAccessToken()
      if (!token) throw new Error(t('errors.sessionExpired'))
      const result = await fetchCurrentMember(token)
      if (!result.ok) throw new Error(t('checkout.memberFailed'))
      return result.data
    },
  })

  const paymentsQuery = useQuery({
    queryKey: ['member', 'payments', 'checkout'],
    queryFn: async () => {
      const token = await getAccessToken()
      if (!token) throw new Error(t('errors.sessionExpired'))
      const result = await fetchMyPayments(token)
      if (!result.ok) throw new Error(t('checkout.paymentsFailed'))
      return result.data
    },
  })

  const member = memberQuery.data
  const config = configQuery.data
  const currency = member?.currency ?? config?.currency ?? 'USD'

  const latestPending = useMemo(() => {
    const rows = paymentsQuery.data ?? []
    return rows.find((p) => p.status === 'Pending') ?? null
  }, [paymentsQuery.data])

  const activePending = pendingTx ?? latestPending

  const amountDue = member?.nextPaymentAmount ?? null
  const nextType = member?.nextPaymentType ?? null

  const pageLoading = configQuery.isLoading || memberQuery.isLoading || paymentsQuery.isLoading
  const pageError =
    configQuery.error?.message ??
    memberQuery.error?.message ??
    paymentsQuery.error?.message ??
    null

  async function onInitiate() {
    if (!member?.id) return
    setError(null)
    setLoading(true)
    try {
      const token = await getAccessToken()
      if (!token) {
        setError(t('errors.sessionExpired'))
        return
      }
      const result = await initiatePayment(token, { memberId: member.id, method })
      if (!result.ok) {
        setError(result.message ?? t('checkout.initiateFailed'))
        return
      }
      setPendingTx(result.data)
      void queryClient.invalidateQueries({ queryKey: ['member'] })
    } finally {
      setLoading(false)
    }
  }

  async function onConfirm(paymentId: string) {
    setError(null)
    setLoading(true)
    try {
      const token = await getAccessToken()
      if (!token) {
        setError(t('errors.sessionExpired'))
        return
      }
      const result = await confirmPayment(token, paymentId)
      if (!result.ok) {
        setError(result.message ?? t('checkout.confirmFailed'))
        return
      }
      await refreshSession()
      void queryClient.invalidateQueries({ queryKey: ['member'] })
      const matricule = result.data.matriculeCode ?? ''
      navigate(`/payment/success${matricule ? `?matricule=${encodeURIComponent(matricule)}` : ''}`, {
        replace: true,
      })
    } finally {
      setLoading(false)
    }
  }

  if (pageLoading) {
    return (
      <div className="page-stack">
        <p className="page-lead">{t('checkout.loading')}</p>
      </div>
    )
  }

  if (pageError) {
    return (
      <div className="page-stack">
        <p className="form-error">{pageError}</p>
        <Link to="/home" className="btn-secondary">
          {t('checkout.backToWallet')}
        </Link>
      </div>
    )
  }

  if (activePending) {
    return (
      <div className="page-stack">
        <h1 className="page-title">{t('checkout.pendingTitle')}</h1>
        <p className="page-lead">{t('checkout.pendingLead')}</p>
        <div className="checkout-summary">
          <p className="checkout-summary-label">{paymentTypeLabel(t, activePending.paymentType)}</p>
          <p className="checkout-summary-amount">
            {formatMoney(activePending.amount, activePending.currency, locale)}
          </p>
          <p className="page-meta">{t('checkout.methodLine', { method: activePending.method })}</p>
        </div>
        {error ? <p className="form-error">{error}</p> : null}
        <button
          type="button"
          className="btn-primary"
          disabled={loading}
          onClick={() => void onConfirm(activePending.id)}
        >
          {loading ? t('checkout.processing') : t('checkout.confirmSimulation')}
        </button>
        <p className="mt-4 text-sm text-stone-500">{t('checkout.simulationNote')}</p>
        <p className="mt-8 text-center text-sm text-stone-500">
          <Link
            to="/home"
            className="font-medium text-amber-800 underline-offset-4 hover:underline dark:text-amber-300"
          >
            {t('checkout.backToWallet')}
          </Link>
        </p>
      </div>
    )
  }

  if (nextType === null && member?.scolarFeeActive) {
    const expires = member.scolarFeeExpiresAt
      ? new Date(member.scolarFeeExpiresAt).toLocaleDateString(locale)
      : null
    return (
      <div className="page-stack">
        <h1 className="page-title">{t('checkout.allSetTitle')}</h1>
        <p className="page-lead">{t('checkout.allSetLead')}</p>
        {member.matriculeCode ? (
          <p className="font-dream-serif text-2xl font-semibold text-amber-700 dark:text-amber-300">
            {member.matriculeCode}
          </p>
        ) : null}
        {expires ? (
          <p className="page-meta">{t('checkout.expiresOn', { date: expires })}</p>
        ) : null}
        <Link to="/home" className="btn-secondary">
          {t('checkout.backToWallet')}
        </Link>
      </div>
    )
  }

  if (nextType === null) {
    return (
      <div className="page-stack">
        <h1 className="page-title">{t('checkout.nothingDueTitle')}</h1>
        <p className="page-lead">{t('checkout.nothingDueLead')}</p>
        <button type="button" className="btn-secondary" onClick={() => void memberQuery.refetch()}>
          {t('checkout.refresh')}
        </button>
        <p className="mt-8 text-center text-sm text-stone-500">
          <Link
            to="/home"
            className="font-medium text-amber-800 underline-offset-4 hover:underline dark:text-amber-300"
          >
            {t('checkout.backToWallet')}
          </Link>
        </p>
      </div>
    )
  }

  const feeLabel = paymentTypeLabel(t, nextType)
  const displayAmount = amountDue ?? (nextType === 'Registration' ? config?.registrationFee : config?.scolarFee) ?? 0
  const validityDays = config?.scolarFeeValidityDays ?? 30

  return (
    <div className="page-stack">
      <h1 className="page-title">{t('checkout.title')}</h1>
      <p className="page-lead">
        {nextType === 'Registration'
          ? t('checkout.leadRegistration', { days: validityDays })
          : t('checkout.leadScolar', { days: validityDays })}
      </p>

      <div className="checkout-summary">
        <p className="checkout-summary-label">{feeLabel}</p>
        <p className="checkout-summary-amount">{formatMoney(displayAmount, currency, locale)}</p>
      </div>

      <form
        className="checkout-form"
        onSubmit={(e) => {
          e.preventDefault()
          void onInitiate()
        }}
      >
        <label className="field">
          <span>{t('checkout.method')}</span>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as PaymentMethod)}
            className="field-select"
          >
            <option value="Mpesa">M-Pesa</option>
          </select>
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <button type="submit" className="btn-primary" disabled={loading || !member?.id}>
          {loading ? t('checkout.processing') : t('checkout.pay', { amount: formatMoney(displayAmount, currency, locale) })}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-stone-500">
        <Link
          to="/home"
          className="font-medium text-amber-800 underline-offset-4 hover:underline dark:text-amber-300"
        >
          {t('checkout.backToWallet')}
        </Link>
      </p>
    </div>
  )
}
