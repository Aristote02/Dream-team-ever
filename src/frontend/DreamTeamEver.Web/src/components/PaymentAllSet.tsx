import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { useLocale } from '@/i18n/LocaleProvider'
import '../pages/payment-all-set.css'

type PaymentAllSetProps = {
  title?: string
  lead?: string
  matriculeCode?: string | null
  expiresAt?: string | null
}

export function PaymentAllSet({ title, lead, matriculeCode, expiresAt }: PaymentAllSetProps) {
  const { locale, t } = useLocale()

  const expiresLabel = expiresAt
    ? t('checkout.expiresOn', {
        date: new Date(expiresAt).toLocaleDateString(locale),
      })
    : null

  return (
    <div className="payment-all-set">
      <div className="payment-all-set-card">
        <div className="payment-all-set-icon" aria-hidden>
          <ShieldCheck className="size-7" strokeWidth={2} />
        </div>

        <h1 className="payment-all-set-title">{title ?? t('checkout.allSetTitle')}</h1>
        <p className="payment-all-set-lead">{lead ?? t('checkout.allSetLead')}</p>

        {matriculeCode ? (
          <div className="payment-all-set-matricule">
            <p className="payment-all-set-matricule-label">{t('checkout.matriculeLabel')}</p>
            <p className="payment-all-set-matricule-code">{matriculeCode}</p>
          </div>
        ) : null}

        {expiresLabel ? <p className="payment-all-set-expires">{expiresLabel}</p> : null}

        <Link to="/home" className="payment-all-set-btn">
          {t('checkout.backToWallet')}
        </Link>
      </div>
    </div>
  )
}
