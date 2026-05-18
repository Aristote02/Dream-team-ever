import { Link } from 'react-router-dom'
import { useLocale } from '../i18n/LocaleProvider'
import './Pages.css'

export function PaymentCancelPage() {
  const { t } = useLocale()

  return (
    <div className="page-stack">
      <h1 className="page-title">{t('payment.cancelTitle')}</h1>
      <p className="page-lead">
        {t('payment.cancelLead')}
      </p>
      <Link to="/checkout" className="btn-primary">
        {t('payment.tryAgain')}
      </Link>
    </div>
  )
}
