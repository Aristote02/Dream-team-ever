import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchCurrentMember } from '../api/authApi'
import { useAuth } from '../auth/useAuth'
import { useLocale } from '../i18n/LocaleProvider'
import { PaymentAllSet } from '../components/PaymentAllSet'

export function PaymentSuccessPage() {
  const { t } = useLocale()
  const { getAccessToken } = useAuth()
  const [params] = useSearchParams()
  const matriculeFromUrl = params.get('matricule')?.trim() ?? null

  const memberQuery = useQuery({
    queryKey: ['member', 'me', 'payment-success'],
    queryFn: async () => {
      const token = await getAccessToken()
      if (!token) throw new Error(t('errors.sessionExpired'))
      const result = await fetchCurrentMember(token)
      if (!result.ok) throw new Error(t('view.loadFailed'))
      return result.data
    },
  })

  const member = memberQuery.data

  if (memberQuery.isLoading) {
    return (
      <div className="payment-all-set">
        <p className="payment-all-set-lead">{t('common.loading')}</p>
      </div>
    )
  }

  const matriculeCode = matriculeFromUrl ?? member?.matriculeCode ?? null
  const isAllSet = member?.scolarFeeActive && !member?.nextPaymentType

  return (
    <PaymentAllSet
      title={isAllSet ? undefined : t('payment.successTitle')}
      lead={isAllSet ? undefined : t('payment.successLead')}
      matriculeCode={matriculeCode}
      expiresAt={member?.scolarFeeExpiresAt ?? null}
    />
  )
}
