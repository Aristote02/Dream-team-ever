import { Reveal } from './Reveal'
import { FeatureIcon } from './FeatureIcon'
import { useLocale } from '../../i18n/LocaleProvider'
import type { TranslationKey } from '../../i18n/translations'

type FeatureItem = {
  icon: 'shield' | 'wallet' | 'zap' | 'globe' | 'lock' | 'users'
  titleKey: TranslationKey
  descKey: TranslationKey
}

const FEATURES: FeatureItem[] = [
  { icon: 'shield', titleKey: 'landing.features.matriculeTitle', descKey: 'landing.features.matriculeDesc' },
  { icon: 'wallet', titleKey: 'landing.features.walletTitle', descKey: 'landing.features.walletDesc' },
  { icon: 'zap', titleKey: 'landing.features.paymentsTitle', descKey: 'landing.features.paymentsDesc' },
  { icon: 'globe', titleKey: 'landing.features.bilingualTitle', descKey: 'landing.features.bilingualDesc' },
  { icon: 'lock', titleKey: 'landing.features.securityTitle', descKey: 'landing.features.securityDesc' },
  { icon: 'users', titleKey: 'landing.features.adminTitle', descKey: 'landing.features.adminDesc' },
]

export function FeaturesSection() {
  const { t } = useLocale()

  return (
    <section className="l-border relative overflow-hidden border-t px-4 py-20 sm:px-6 sm:py-28">
      <div className="landing-orb left-[10%] top-[15%] h-72 w-72 bg-amber-500/15" aria-hidden />
      <div className="landing-orb right-[5%] bottom-[10%] h-96 w-96 bg-amber-600/10" aria-hidden />
      <div className="landing-features-bokeh pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative mx-auto max-w-7xl">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.3em] gold-text">{t('landing.features.label')}</p>
          <h2 className="font-display l-heading mt-4 max-w-2xl text-3xl sm:text-4xl lg:text-5xl">
            {t('landing.features.title')}
          </h2>
          <p className="l-body mt-4 max-w-xl text-lg">{t('landing.features.subtitle')}</p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.titleKey} delay={i * 0.08} className="h-full">
              <article className="glass-card group h-full rounded-3xl border p-8 transition hover:border-amber-500/35">
                <div
                  className="grid size-12 place-items-center rounded-full gold-gradient shadow-lg shadow-amber-900/40 ring-1 ring-amber-200/20"
                  aria-hidden
                >
                  <FeatureIcon name={f.icon} />
                </div>
                <h3 className="font-display l-heading mt-6 text-xl sm:text-2xl">{t(f.titleKey)}</h3>
                <p className="l-body mt-3 text-sm leading-relaxed sm:text-base">{t(f.descKey)}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
