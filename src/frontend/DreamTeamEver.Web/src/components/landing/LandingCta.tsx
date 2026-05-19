import { Link } from 'react-router-dom'
import { Reveal } from './Reveal'
import { useLocale } from '../../i18n/LocaleProvider'

export function LandingCta() {
  const { t } = useLocale()

  return (
    <section className="px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="w-full">
          <div className="landing-cta-panel relative flex flex-col items-center overflow-hidden rounded-[2.5rem] px-8 py-20 text-center sm:px-16 sm:py-24">
            <div className="landing-cta-glow pointer-events-none absolute inset-0" aria-hidden />
            <div className="landing-cta-bokeh pointer-events-none absolute inset-0" aria-hidden />

            <h2 className="landing-cta-heading relative font-display text-4xl leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              {t('landing.cta.title')}{' '}
              <span className="gold-text">
                {t('landing.cta.titleHighlight')}
                {t('landing.cta.titleEnd')}
              </span>
            </h2>
            <p className="landing-cta-body relative mt-6 max-w-xl text-pretty text-base leading-relaxed sm:text-lg">
              {t('landing.cta.body')}
            </p>
            <div className="relative mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link to="/register" className="landing-cta-primary group">
                {t('landing.cta.primary')}
                <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
              <Link to="/login" className="landing-cta-secondary">
                {t('landing.cta.secondary')}
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
