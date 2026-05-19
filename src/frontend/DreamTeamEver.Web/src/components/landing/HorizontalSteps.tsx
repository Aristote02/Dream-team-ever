import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { useLocale } from '../../i18n/LocaleProvider'
import type { TranslationKey } from '../../i18n/translations'

const STEPS = [
  { n: '01', titleKey: 'landing.steps.step1', descKey: 'landing.steps.step1Desc' },
  { n: '02', titleKey: 'landing.steps.step2', descKey: 'landing.steps.step2Desc' },
  { n: '03', titleKey: 'landing.steps.step3', descKey: 'landing.steps.step3Desc' },
  { n: '04', titleKey: 'landing.steps.step4', descKey: 'landing.steps.step4Desc' },
] as const satisfies readonly {
  n: string
  titleKey: TranslationKey
  descKey: TranslationKey
}[]

export function HorizontalSteps() {
  const { t } = useLocale()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })
  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-75%'])

  return (
    <section
      ref={ref}
      className="relative h-[400vh]"
      aria-label={t('landing.steps.ariaLabel')}
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mx-auto mb-10 w-full max-w-7xl px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.3em] gold-text">
            {t('landing.steps.label')}
          </p>
          <h2 className="font-display l-heading mt-3 text-4xl leading-tight sm:text-6xl">
            {t('landing.steps.titleBefore')}{' '}
            <span className="gold-text">{t('landing.steps.titleHighlight')}</span>
            {t('landing.steps.titleEnd')}
          </h2>
        </div>
        <motion.div style={{ x }} className="flex gap-8 px-[8vw]">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="glass-card relative h-[55vh] w-[80vw] shrink-0 overflow-hidden rounded-[2rem] p-10 sm:w-[60vw] sm:p-14 lg:w-[44vw]"
            >
              <div
                aria-hidden
                className="absolute -right-32 -top-32 size-[400px] rounded-full opacity-30 blur-3xl"
                style={{
                  background: 'radial-gradient(circle, var(--amber-glow), transparent 60%)',
                }}
              />
              <p className="relative font-display text-7xl leading-none gold-text sm:text-9xl">
                {s.n}
              </p>
              <h3 className="relative font-display l-heading mt-8 text-3xl sm:text-4xl">
                {t(s.titleKey)}
              </h3>
              <p className="relative l-body mt-4 max-w-md text-lg">{t(s.descKey)}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
