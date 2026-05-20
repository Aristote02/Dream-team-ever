import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CreditCard, Clock, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { MembershipCard } from '@/components/MembershipCard'
import { useAuth } from '@/auth/useAuth'
import { useLocale } from '@/i18n/LocaleProvider'

export function HomePage() {
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const { t } = useLocale()

  useEffect(() => {
    if (isAdmin) {
      navigate('/students', { replace: true })
    }
  }, [isAdmin, navigate])

  if (isAdmin) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        {t('home.redirecting')}
      </div>
    );
  }

  const matricule = user?.matriculeCode?.trim() || undefined
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
      })
    : undefined

  const actions = [
    { to: '/phone', label: t('home.actions.view'), icon: User, color: 'from-amber-500 to-amber-700' },
    { to: '/checkout', label: t('home.actions.payment'), icon: CreditCard, color: 'from-emerald-500 to-emerald-700' },
    { to: '/historics', label: t('home.actions.historics'), icon: Clock, color: 'from-violet-500 to-violet-700' },
  ] as const

  return (
    <div className="max-w-lg mx-auto space-y-10">
      <div className="text-center space-y-2">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
          {t('home.welcome')}
        </p>
        {user ? (
          <h1 className="font-display text-2xl sm:text-3xl text-foreground">
            {user.displayName}
          </h1>
        ) : null}
        <p className="text-sm text-muted-foreground">{t('home.passSub')}</p>
      </div>

      <MembershipCard
        memberName={user?.displayName || '—'}
        matricule={matricule}
        memberSince={memberSince}
        status={matricule ? 'active' : 'pending'}
      />

      <div className="grid grid-cols-3 gap-4">
        {actions.map((action, i) => (
          <motion.div
            key={action.to}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
          >
            <Link
              to={action.to}
              className="flex flex-col items-center gap-3 rounded-2xl glass-card p-4 hover:border-primary/40 transition-colors"
            >
              <span
                className={`flex size-14 items-center justify-center rounded-full bg-gradient-to-b ${action.color} text-white shadow-lg`}
              >
                <action.icon className="size-6" />
              </span>
              <span className="text-center text-[0.7rem] font-semibold text-muted-foreground">
                {action.label}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
