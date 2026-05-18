import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch, ApiError } from '../api/client'
import type { CreateCheckoutPayload, CreateCheckoutResult } from '../types/payment'
import { useLocale } from '../i18n/LocaleProvider'
import './Pages.css'

/** Change this path to match your backend (e.g. /payments/checkout-session). */
const CREATE_CHECKOUT_PATH = '/api/payments/checkout'

const PRICE_OPTIONS = [
  { value: '50', amountCents: 5000, labelKey: 'checkout.price50' as const },
  { value: '60', amountCents: 6000, labelKey: 'checkout.price60' as const },
] as const

type PriceValue = (typeof PRICE_OPTIONS)[number]['value']
export function CheckoutPage() {
  const { t } = useLocale()
  const [price, setPrice] = useState<PriceValue>('50')
  const [description, setDescription] = useState(() => t('checkout.orderDescriptionDefault'))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedPrice = PRICE_OPTIONS.find((option) => option.value === price) ?? PRICE_OPTIONS[0]
  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const payload: CreateCheckoutPayload = {
      amountCents: selectedPrice.amountCents,
      currency: 'USD',
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
        setError(t('checkout.noRedirectUrl'))
        return
      }

      window.location.assign(result.url)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError(
          err instanceof Error ? err.message : t('checkout.somethingWrong'),
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-stack">
      <h1 className="page-title">{t('checkout.title')}</h1>
      <p className="page-lead">
        {t('checkout.lead', { path: CREATE_CHECKOUT_PATH })}
      </p>

      <form className="checkout-form" onSubmit={onSubmit}>
        <label className="field">
          <span>{t('checkout.price')}</span>
          <select
            value={price}
            onChange={(e) => setPrice(e.target.value as PriceValue)}
            className="field-select"
          >
            {PRICE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.labelKey)}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>{t('checkout.description')}</span>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? t('checkout.processing') : t('checkout.pay')}
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
