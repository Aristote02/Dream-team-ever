import { useState, type FormEvent } from 'react'
import { apiFetch, ApiError } from '../api/client'
import type { CreateCheckoutPayload, CreateCheckoutResult } from '../types/payment'
import './Pages.css'

/** Change this path to match your backend (e.g. /payments/checkout-session). */
const CREATE_CHECKOUT_PATH = '/api/payments/checkout'

export function CheckoutPage() {
  const [amount, setAmount] = useState('9.99')
  const [currency, setCurrency] = useState('USD')
  const [description, setDescription] = useState('Order payment')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const amountNum = Number.parseFloat(amount)
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      setError('Enter a valid amount.')
      setLoading(false)
      return
    }

    const amountCents = Math.round(amountNum * 100)

    const payload: CreateCheckoutPayload = {
      amountCents,
      currency: currency.trim().toUpperCase() || 'USD',
      description: description.trim() || undefined,
    }

    try {
      const result = await apiFetch<CreateCheckoutResult>(
        CREATE_CHECKOUT_PATH,
        {
          method: 'POST',
          body: payload,
        },
      )

      if (!result?.url) {
        setError('Backend did not return a redirect URL.')
        return
      }

      window.location.assign(result.url)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError(
          err instanceof Error ? err.message : 'Something went wrong.',
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-stack">
      <h1 className="page-title">Checkout</h1>
      <p className="page-lead">
        Submits a POST to <code>{CREATE_CHECKOUT_PATH}</code> and redirects to
        the URL your API returns.
      </p>

      <form className="checkout-form" onSubmit={onSubmit}>
        <label className="field">
          <span>Amount</span>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoComplete="transaction-amount"
          />
        </label>

        <label className="field">
          <span>Currency</span>
          <input
            type="text"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            maxLength={3}
            autoComplete="transaction-currency"
          />
        </label>

        <label className="field">
          <span>Description</span>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Starting payment…' : 'Pay'}
        </button>
      </form>
    </div>
  )
}
