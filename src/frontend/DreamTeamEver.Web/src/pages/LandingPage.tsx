import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LandingNav } from '../components/landing/LandingNav'
import { Hero3D } from '../components/landing/Hero3D'
import { HorizontalSteps } from '../components/landing/HorizontalSteps'
import { Marquee } from '../components/landing/Marquee'
import { BackgroundVideo } from '../components/landing/BackgroundVideo'
import { FeaturesSection } from '../components/landing/FeaturesSection'
import { LandingCta } from '../components/landing/LandingCta'
import { PaymentCardIcon } from '../components/landing/PaymentCardIcon'
import { Reveal } from '../components/landing/Reveal'
import { useAuth } from '../auth/useAuth'
import { useLocale } from '../i18n/LocaleProvider'
import type { TranslationKey } from '../i18n/translations'
import '../landing/landing.css'

const WHY_ITEMS: { n: string; titleKey: TranslationKey; descKey: TranslationKey }[] = [
  { n: '01', titleKey: 'landing.why.item1Title', descKey: 'landing.why.item1Desc' },
  { n: '02', titleKey: 'landing.why.item2Title', descKey: 'landing.why.item2Desc' },
  { n: '03', titleKey: 'landing.why.item3Title', descKey: 'landing.why.item3Desc' },
  { n: '04', titleKey: 'landing.why.item4Title', descKey: 'landing.why.item4Desc' },
]

export function LandingPage() {
  const { t } = useLocale()
  const { user, authReady } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (authReady && user) {
      navigate('/home', { replace: true })
    }
  }, [authReady, user, navigate])

  if (authReady && user) {
    return null
  }

  return (
    <div className="landing-page min-h-screen w-full">
      <BackgroundVideo />
      <div className="relative z-10 mesh-bg min-h-screen">
      <LandingNav />

      <main>
        <Hero3D />

        <Marquee />

        {/* What */}
        <section className="px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <p className="text-xs font-bold uppercase tracking-[0.3em] gold-text">{t('landing.what.label')}</p>
              <h2 className="font-display l-heading mt-4 text-3xl leading-tight sm:text-4xl lg:text-5xl">
                {t('landing.what.title')}{' '}
                <span className="gold-text">{t('landing.what.titleHighlight')}</span>
                {t('landing.what.titleEnd')}
              </h2>
              <p className="l-body mt-6 text-lg leading-relaxed">{t('landing.what.body')}</p>
              <Link
                to="/register"
                className="mt-8 inline-flex items-center gap-2 rounded-full gold-gradient px-5 py-3 text-sm font-bold text-stone-900"
              >
                {t('landing.what.cta')} →
              </Link>
            </Reveal>
            <Reveal delay={0.12} className="grid grid-cols-2 gap-4">
              <div className="l-border col-span-2 aspect-[16/10] overflow-hidden rounded-3xl border bg-stone-200 dark:bg-stone-900">
                <img
                  src="/landing-students.png"
                  alt={t('landing.what.studentsAlt')}
                  className="size-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="landing-payment-card flex aspect-square flex-col items-start gap-4 rounded-3xl p-6 sm:p-7">
                <PaymentCardIcon className="landing-payment-icon size-7" />
                <p className="font-display text-2xl leading-none tracking-tight landing-payment-label">
                  M-Pesa
                </p>
              </div>
              <div className="l-border aspect-[4/5] overflow-hidden rounded-3xl border bg-stone-200 dark:bg-stone-900">
                <img
                  src="/landing-wallet.png"
                  alt={t('landing.what.walletAlt')}
                  className="size-full object-cover object-top"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </Reveal>
          </div>
        </section>

        <FeaturesSection />

        {/* Why */}
        <section className="l-border border-t px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12">
            <Reveal className="lg:col-span-4">
              <p className="text-xs font-bold uppercase tracking-[0.3em] gold-text">{t('landing.why.label')}</p>
              <h2 className="font-display l-heading mt-4 text-3xl leading-tight sm:text-4xl">
                {t('landing.why.title')}{' '}
                <span className="gold-text">{t('landing.why.titleHighlight')}</span>
                {t('landing.why.titleEnd')}
              </h2>
              <p className="l-body mt-6">{t('landing.why.body')}</p>
            </Reveal>
            <div className="grid gap-5 sm:grid-cols-2 lg:col-span-8">
              {WHY_ITEMS.map((w, i) => (
                <Reveal key={w.n} delay={i * 0.1}>
                <div className="glass-card h-full rounded-3xl p-7">
                  <p className="font-display text-5xl gold-text">{w.n}</p>
                  <h3 className="font-display l-heading mt-4 text-xl">{t(w.titleKey)}</h3>
                  <p className="l-body mt-2 text-sm">{t(w.descKey)}</p>
                </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <HorizontalSteps />


        <LandingCta />
      </main>

      <footer className="l-border border-t px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs l-muted sm:flex-row">
          <p className="uppercase tracking-[0.25em]">{t('landing.footer.tagline')}</p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/login" className="l-link transition">
              {t('common.signIn')}
            </Link>
            <Link to="/register" className="l-link transition">
              {t('landing.footer.register')}
            </Link>
            <Link to="/forgot-password" className="l-link transition">
              {t('landing.footer.forgotPassword')}
            </Link>
          </div>
        </div>
      </footer>
      </div>
    </div>
  )
}
