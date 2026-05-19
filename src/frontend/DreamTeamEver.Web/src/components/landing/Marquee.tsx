import { motion } from 'framer-motion'
import { useLocale } from '../../i18n/LocaleProvider'
import type { TranslationKey } from '../../i18n/translations'

const MARQUEE_TEXT_KEYS = [
  'landing.marquee.wallet',
  'landing.marquee.matricule',
  'landing.marquee.mpesa',
  'landing.marquee.bilingual',
  'landing.marquee.security',
  'landing.marquee.location',
] as const satisfies readonly TranslationKey[]

const STAR = '★'

export function Marquee() {
  const { t } = useLocale()
  const items = MARQUEE_TEXT_KEYS.flatMap((key) => [t(key), STAR])
  const loop = [...items, ...items, ...items]

  return (
    <section
      className="l-marquee relative overflow-hidden border-y py-12 backdrop-blur-sm"
      aria-hidden
    >
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: ['0%', '-33.333%'] }}
        transition={{ duration: 30, ease: 'linear', repeat: Infinity }}
      >
        {loop.map((text, i) => (
          <span
            key={i}
            className={`font-display text-3xl tracking-tight sm:text-5xl ${
              text === STAR ? 'gold-text' : 'l-heading opacity-80'
            }`}
          >
            {text}
          </span>
        ))}
      </motion.div>
    </section>
  )
}
