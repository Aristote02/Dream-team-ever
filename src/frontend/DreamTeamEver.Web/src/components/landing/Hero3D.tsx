import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import { useRef, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { BrandLogo } from '../BrandLogo'
import { useLocale } from '../../i18n/LocaleProvider'
import { Hero3DScene } from './Hero3DScene'
import { PaymentCardIcon } from './PaymentCardIcon'

export function Hero3D() {
  const { t } = useLocale()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [0, 200])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const cardRotateScroll = useTransform(scrollYProgress, [0, 1], [0, 30])

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [12, -12]), { stiffness: 120, damping: 18 })
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-18, 18]), { stiffness: 120, damping: 18 })

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }
  const onLeave = () => {
    mx.set(0)
    my.set(0)
  }

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen items-center overflow-hidden pt-24"
    >
      <motion.div
        aria-hidden
        className="absolute -left-32 -top-32 size-[520px] rounded-full opacity-50 blur-3xl"
        style={{ background: 'radial-gradient(circle, var(--amber-glow), transparent 60%)' }}
        animate={{ x: [0, 60, 0], y: [0, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="absolute bottom-0 right-0 size-[600px] rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(circle, var(--violet-soft), transparent 60%)' }}
        animate={{ x: [0, -50, 0], y: [0, -40, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        style={{ y, opacity }}
        className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2"
      >
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="gold-text inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold"
          >
            <span aria-hidden className="text-sm">
              ✦
            </span>
            {t('landing.hero.badge')}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="font-display l-heading mt-6 text-5xl leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
          >
            {t('landing.hero.title')}{' '}
            <span className="gold-text">{t('landing.hero.titleHighlight')}</span>
            <br />
            {t('landing.hero.titleEnd')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="l-body mt-6 max-w-lg text-lg"
          >
            {t('landing.hero.lead')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 rounded-full gold-gradient px-6 py-3.5 text-sm font-bold text-stone-900 shadow-xl shadow-amber-900/30 transition-transform hover:scale-105"
            >
              {t('landing.hero.ctaPrimary')}
              <span
                aria-hidden
                className="transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
            <Link
              to="/login"
              className="l-btn-ghost inline-flex items-center gap-2 rounded-full border px-6 py-3.5 text-sm font-semibold backdrop-blur transition-colors"
            >
              {t('landing.hero.ctaSecondary')}
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="mt-12 flex flex-wrap items-stretch"
            role="group"
            aria-label="Statistics"
          >
            {(
              [
                {
                  value: t('landing.hero.statMembersValue'),
                  label: t('landing.hero.statMembers'),
                },
                {
                  value: t('landing.hero.statUptimeValue'),
                  label: t('landing.hero.statUptime'),
                },
                {
                  value: t('landing.hero.statSupportValue'),
                  label: t('landing.hero.statSupport'),
                },
              ] as const
            ).map((stat, index) => (
              <div key={stat.label} className="flex items-stretch">
                {index > 0 ? (
                  <div className="landing-hero-stat-divider mx-6 sm:mx-10" aria-hidden />
                ) : null}
                <div>
                  <p className="font-display text-3xl leading-none gold-text sm:text-4xl">{stat.value}</p>
                  <p className="l-muted mt-2 text-[10px] font-bold uppercase tracking-[0.28em]">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        <div
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          className="relative h-[480px] [perspective:1600px] sm:h-[600px]"
        >
          <div className="absolute inset-0">
            <Hero3DScene />
          </div>

          <motion.div
            style={{
              rotateX: rx,
              rotateY: ry,
              transformStyle: 'preserve-3d',
            }}
            initial={{ opacity: 0, scale: 0.85, rotateY: -30 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.9, ease: [0.32, 0.72, 0, 1] }}
            className="pointer-events-none absolute inset-0 m-auto h-[190px] w-[300px] sm:h-[240px] sm:w-[380px]"
          >
            <motion.div
              style={{ rotate: cardRotateScroll }}
              className="landing-hero-card relative size-full overflow-hidden rounded-3xl p-6 shadow-2xl shadow-amber-900/60 ring-1 ring-amber-100/30 gold-gradient"
            >
              <div className="flex items-start justify-between text-stone-900">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] opacity-70">
                    {t('landing.hero.cardMembership')}
                  </p>
                  <p className="font-display mt-1 text-xl">{t('appName')}</p>
                </div>
                <BrandLogo className="size-9 rounded-lg bg-stone-900/15 p-1" alt="" />
              </div>
              <div className="absolute bottom-6 left-6 right-6 text-stone-900">
                <p className="text-[10px] uppercase tracking-[0.25em] opacity-70">
                  {t('landing.hero.cardMatricule')}
                </p>
                <p className="font-display mt-1 text-2xl tracking-widest">DTE · 2025 · 0042</p>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="glass-card absolute -right-4 -top-6 rounded-2xl px-4 py-3 text-xs sm:-right-12"
              style={{ transform: 'translateZ(60px)' }}
            >
              <p className="l-muted text-[10px] uppercase tracking-widest">
                {t('landing.hero.cardStatus')}
              </p>
              <p className="mt-1 flex items-center gap-2 font-bold text-emerald-400">
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
                {t('landing.hero.cardActive')}
              </p>
            </motion.div>
            <motion.div
              animate={{ y: [0, 14, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="landing-payment-card absolute -bottom-6 -left-4 flex flex-col items-start gap-3 rounded-2xl px-5 py-4 sm:-left-10"
              style={{ transform: 'translateZ(60px)' }}
            >
              <PaymentCardIcon className="landing-payment-icon size-6" />
              <p className="font-display text-xl leading-none tracking-tight landing-payment-label sm:text-2xl">
                {t('landing.hero.cardPaidMethods')}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="l-muted absolute bottom-8 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.3em]"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {t('landing.hero.scroll')} ↓
        </motion.div>
      </motion.div>
    </section>
  )
}
