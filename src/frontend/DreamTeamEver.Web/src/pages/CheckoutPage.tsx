import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchCurrentMember, fetchMyPayments } from '../api/authApi'
import { confirmPayment, fetchPaymentById, fetchRegistrationConfig, initiatePayment } from '../api/paymentApi'
import { useAuth } from '../auth/useAuth'
import { useLocale } from '../i18n/LocaleProvider'
import { PaymentAllSet } from '../components/PaymentAllSet'
import { paymentTypeLabel } from '../i18n/paymentTypeLabel'
import type { PaymentMethod, PaymentTransactionDto } from '../types/payment'
import './checkout-page.css'

const PAYMENT_POLL_MS = 4000

function formatMoney(amount: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatTotalDue(amount: number, currency: string, locale: string): string {
  const code = (currency || 'USD').toUpperCase()
  const amountStr = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)

  if (locale === 'fr' || locale.startsWith('fr-')) {
    return `${amountStr} ${code}`
  }

  const withSymbol = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)

  return `${withSymbol} ${code}`
}

function CheckoutShell({ children }: { children: ReactNode }) {
  return (
    <div className="checkout-page">
      <div className="checkout-page-glow" aria-hidden />
      <div className="checkout-card">{children}</div>
    </div>
  )
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
  const allowSimulation = config?.allowPaymentSimulation ?? false
  const mpesaEnabled = config?.mpesaEnabled ?? false

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

  useEffect(() => {
    if (!activePending || activePending.status !== 'Pending') {
      return
    }

    if (activePending.method === 'Mpesa' && !mpesaEnabled && !allowSimulation) {
      return
    }

    let cancelled = false

    const poll = async () => {
      const token = await getAccessToken()
      if (!token || cancelled) return

      const result = await fetchPaymentById(token, activePending.id)
      if (!result.ok || cancelled) return

      if (result.data.status === 'Completed') {
        await refreshSession()
        void queryClient.invalidateQueries({ queryKey: ['member'] })
        const memberResult = await fetchCurrentMember(token)
        const matricule =
          memberResult.ok && memberResult.data.matriculeCode
            ? memberResult.data.matriculeCode
            : ''
        navigate(`/payment/success${matricule ? `?matricule=${encodeURIComponent(matricule)}` : ''}`, {
          replace: true,
        })
        return
      }

      if (result.data.status === 'Failed') {
        setError(result.data.failureReason ?? t('checkout.paymentFailed'))
        setPendingTx(null)
        void queryClient.invalidateQueries({ queryKey: ['member', 'payments'] })
      }
    }

    const intervalId = window.setInterval(() => {
      void poll()
    }, PAYMENT_POLL_MS)

    void poll()

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [
    activePending?.id,
    activePending?.status,
    activePending?.method,
    allowSimulation,
    getAccessToken,
    member?.matriculeCode,
    mpesaEnabled,
    navigate,
    queryClient,
    refreshSession,
    t,
  ])

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
      if (result.data.status === 'Failed') {
        setError(result.data.failureReason ?? t('checkout.initiateFailed'))
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
      <CheckoutShell>
        <p className="checkout-loading">{t('checkout.loading')}</p>
      </CheckoutShell>
    )
  }

  if (pageError) {
    return (
      <CheckoutShell>
        <p className="checkout-error">{pageError}</p>
        <Link to="/home" className="checkout-back">
          ← {t('checkout.back')}
        </Link>
      </CheckoutShell>
    )
  }

  if (activePending) {
    const showSimulation = allowSimulation
    const showMpesaWait = activePending.method === 'Mpesa' && mpesaEnabled && !showSimulation

    return (
      <CheckoutShell>
        <header className="checkout-card-header">
          <h1 className="checkout-card-title">{t('checkout.pendingTitle')}</h1>
          <p className="checkout-card-lead">
            {showMpesaWait ? t('checkout.pendingLeadMpesa') : t('checkout.pendingLead')}
          </p>
        </header>

        <div className="checkout-total-row">
          <div>
            <p className="checkout-total-label">{t('checkout.totalDue')}</p>
            <p className="checkout-total-amount">
              {formatTotalDue(activePending.amount, activePending.currency, locale)}
            </p>
          </div>
          <span className="checkout-secure-badge">{t('checkout.secureBadge')}</span>
        </div>

        <div className="checkout-summary-box">
          <div className="checkout-summary-line">
            <span>{paymentTypeLabel(t, activePending.paymentType)}</span>
            <strong>{formatMoney(activePending.amount, activePending.currency, locale)}</strong>
          </div>
          <div className="checkout-summary-line">
            <span>{t('checkout.method')}</span>
            <strong>{activePending.method === 'Mpesa' ? 'M-Pesa' : t('checkout.orangeMoney')}</strong>
          </div>
          {activePending.providerReference ? (
            <div className="checkout-summary-line">
              <span>{t('checkout.reference')}</span>
              <strong className="checkout-ref">{activePending.providerReference}</strong>
            </div>
          ) : null}
        </div>

        {showMpesaWait ? (
          <p className="checkout-polling" role="status">
            {t('checkout.waitingMpesa')}
          </p>
        ) : null}

        {error ? <p className="checkout-error">{error}</p> : null}

        {showSimulation ? (
          <>
            <button
              type="button"
              className="checkout-btn-primary"
              disabled={loading}
              onClick={() => void onConfirm(activePending.id)}
            >
              {loading ? t('checkout.processing') : t('checkout.confirmSimulation')}
            </button>
            <p className="checkout-footnote">{t('checkout.simulationNote')}</p>
          </>
        ) : null}

        <Link to="/home" className="checkout-back">
          ← {t('checkout.back')}
        </Link>
      </CheckoutShell>
    )
  }

  if (nextType === null && member?.scolarFeeActive) {
    return (
      <PaymentAllSet
        matriculeCode={member.matriculeCode}
        expiresAt={member.scolarFeeExpiresAt}
      />
    )
  }

  if (nextType === null) {
    return (
      <CheckoutShell>
        <header className="checkout-card-header">
          <h1 className="checkout-card-title">{t('checkout.nothingDueTitle')}</h1>
          <p className="checkout-card-lead">{t('checkout.nothingDueLead')}</p>
        </header>
        <button
          type="button"
          className="checkout-btn-primary"
          onClick={() => void memberQuery.refetch()}
        >
          {t('checkout.refresh')}
        </button>
        <Link to="/home" className="checkout-back">
          ← {t('checkout.back')}
        </Link>
      </CheckoutShell>
    )
  }

  const feeLabel = paymentTypeLabel(t, nextType)
  const displayAmount =
    amountDue ?? (nextType === 'Registration' ? config?.registrationFee : config?.scolarFee) ?? 0
  const secureLead =
    nextType === 'Registration'
      ? t('checkout.secureLeadRegistration')
      : t('checkout.secureLeadScolar')

  return (
    <CheckoutShell>
      <header className="checkout-card-header">
        <h1 className="checkout-card-title">{t('checkout.secureTitle')}</h1>
        <p className="checkout-card-lead">{secureLead}</p>
      </header>

      <div className="checkout-total-row">
        <div>
          <p className="checkout-total-label">{t('checkout.totalDue')}</p>
          <p className="checkout-total-amount">{formatTotalDue(displayAmount, currency, locale)}</p>
        </div>
        <span className="checkout-secure-badge">{t('checkout.secureBadge')}</span>
      </div>

      <p className="checkout-section-label">{t('checkout.selectPaymentMethod')}</p>
      <div className="checkout-method-grid">
        <button
          type="button"
          className={`checkout-method-card${method === 'Mpesa' ? ' is-selected' : ''}`}
          onClick={() => setMethod('Mpesa')}
          aria-pressed={method === 'Mpesa'}
        >
          <span className="checkout-method-icon checkout-method-icon--mpesa" aria-hidden>
            M
          </span>
          <span className="checkout-method-text">
            <p className="checkout-method-name">M-Pesa</p>
            <p className="checkout-method-sub">{t('checkout.mpesaNetwork')}</p>
          </span>
          <span className="checkout-method-radio" aria-hidden />
        </button>
        <div className="checkout-method-card is-disabled" aria-disabled>
          <span className="checkout-method-icon checkout-method-icon--orange" aria-hidden>
            O
          </span>
          <span className="checkout-method-text">
            <p className="checkout-method-name">{t('checkout.orangeMoney')}</p>
            <p className="checkout-method-sub">{t('checkout.orangeComingSoon')}</p>
          </span>
        </div>
      </div>

      <div className="checkout-summary-box">
        <div className="checkout-summary-line">
          <span>{feeLabel}</span>
          <strong>{formatMoney(displayAmount, currency, locale)}</strong>
        </div>
        <div className="checkout-summary-line">
          <span>{t('checkout.serviceCharge')}</span>
          <span className="checkout-summary-free">{t('checkout.serviceChargeFree')}</span>
        </div>
        <hr className="checkout-summary-divider" />
        <div className="checkout-summary-total">
          <span>{t('checkout.totalPayment')}</span>
          <strong>{formatMoney(displayAmount, currency, locale)}</strong>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          void onInitiate()
        }}
      >
        {error ? <p className="checkout-error">{error}</p> : null}
        <button type="submit" className="checkout-btn-primary" disabled={loading || !member?.id}>
          {loading ? t('checkout.processing') : t('checkout.initiatePayment')}
        </button>
      </form>

      <p className="checkout-footnote">
        {mpesaEnabled && method === 'Mpesa'
          ? t('checkout.pushNoteMpesa')
          : t('checkout.pushNote')}
      </p>
      <Link to="/home" className="checkout-back">
        ← {t('checkout.back')}
      </Link>
    </CheckoutShell>
  )
}
