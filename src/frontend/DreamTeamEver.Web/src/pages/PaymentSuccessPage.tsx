import { Link, useSearchParams } from 'react-router-dom'
import { useLocale } from '../i18n/LocaleProvider'
import './Pages.css'

export function PaymentSuccessPage() {
  const { t } = useLocale()
  const [params] = useSearchParams()
  const sessionId = params.get('session_id') ?? params.get('sessionId')

  return (
    <div className="page-stack">
      <h1 className="page-title">{t('payment.successTitle')}</h1>
      <p className="page-lead">
        {t('payment.successLead')}
      </p>
      {sessionId ? (
        <p className="page-meta">
          {t('payment.sessionRef', { id: sessionId })}
        </p>
      ) : null}
      <Link to="/home" className="btn-secondary">
        {t('common.backToHome')}
      </Link>
    </div>
  )
}
