import { Link } from 'react-router-dom'
import { Reveal } from './Reveal'
import { useLocale } from '../../i18n/LocaleProvider'

export function LandingCta() {
  const { t } = useLocale()

  return (
    <section className="px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="landing-cta-panel l-panel relative overflow-hidden rounded-[2.5rem] border px-8 py-16 text-center backdrop-blur-md sm:px-16 sm:py-20">
            <div className="landing-cta-glow pointer-events-none absolute inset-0" aria-hidden />
            <div className="landing-features-bokeh pointer-events-none absolute inset-0 opacity-60" aria-hidden />

            <h2 className="relative font-display l-heading text-4xl leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              {t('landing.cta.title')}{' '}
              <span className="gold-text">
                {t('landing.cta.titleHighlight')}
                {t('landing.cta.titleEnd')}
              </span>
            </h2>
            <p className="relative l-body mx-auto mt-6 max-w-xl text-base leading-relaxed sm:text-lg">
              {t('landing.cta.body')}
            </p>
            <div className="relative mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 rounded-full gold-gradient px-7 py-4 text-sm font-bold text-stone-900 shadow-xl shadow-amber-900/40 transition-transform hover:scale-[1.03]"
              >
                {t('landing.cta.primary')}
                <span
                  aria-hidden
                  className="transition-transform group-hover:translate-x-0.5"
                >
                  →
                </span>
              </Link>
              <Link
                to="/login"
                className="l-btn-ghost inline-flex items-center rounded-full border px-7 py-4 text-sm font-semibold backdrop-blur-sm transition-colors"
              >
                {t('landing.cta.secondary')}
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
