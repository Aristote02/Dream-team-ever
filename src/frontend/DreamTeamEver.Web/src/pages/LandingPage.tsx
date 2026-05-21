import { useEffect, useMemo, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  Smartphone,
  Zap,
  Globe2,
  CreditCard,
  Users,
  Lock,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { LandingNav } from '../components/landing/LandingNav'
import { Hero3D } from '../components/landing/Hero3D'
import { Reveal } from '../components/landing/Reveal'
import { BackgroundVideo } from '../components/landing/BackgroundVideo'
import { Marquee } from '../components/landing/Marquee'
import { HorizontalSteps } from '../components/landing/HorizontalSteps'
import { useAuth } from '../auth/useAuth'
import { useLocale } from '../i18n/LocaleProvider'

const students = '/landing-students.png';
const wallet = '/landing-wallet.png';

function ParallaxImage({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  return (
    <div ref={ref} className="relative overflow-hidden rounded-3xl border border-border/60">
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        style={{ y }}
        className="w-full h-full object-cover scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
    </div>
  );
}

export function LandingPage() {
  const { t } = useLocale()
  const { user, authReady } = useAuth()
  const navigate = useNavigate()

  const features = useMemo(
    () => [
      {
        icon: ShieldCheck,
        title: t('landing.features.matriculeTitle'),
        desc: t('landing.features.matriculeDesc'),
      },
      {
        icon: Smartphone,
        title: t('landing.features.walletTitle'),
        desc: t('landing.features.walletDesc'),
      },
      {
        icon: Zap,
        title: t('landing.features.paymentsTitle'),
        desc: t('landing.features.paymentsDesc'),
      },
      {
        icon: Globe2,
        title: t('landing.features.bilingualTitle'),
        desc: t('landing.features.bilingualDesc'),
      },
      {
        icon: Lock,
        title: t('landing.features.securityTitle'),
        desc: t('landing.features.securityDesc'),
      },
      {
        icon: Users,
        title: t('landing.features.adminTitle'),
        desc: t('landing.features.adminDesc'),
      },
    ],
    [t],
  )

  const whyUs = useMemo(
    () => [
      { n: '01', t: t('landing.why.item1Title'), d: t('landing.why.item1Desc') },
      { n: '02', t: t('landing.why.item2Title'), d: t('landing.why.item2Desc') },
      { n: '03', t: t('landing.why.item3Title'), d: t('landing.why.item3Desc') },
      { n: '04', t: t('landing.why.item4Title'), d: t('landing.why.item4Desc') },
    ],
    [t],
  )

  useEffect(() => {
    if (authReady && user) {
      navigate('/home', { replace: true })
    }
  }, [authReady, user, navigate])

  if (authReady && user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col relative isolate text-left">
      <BackgroundVideo />
      <div className="pointer-events-none fixed inset-0 z-[1] mesh-bg-over-video" aria-hidden />
      <div className="relative z-10 flex min-h-screen flex-1 flex-col">
      <LandingNav />
      <main className="flex-1">
        <Hero3D />
        <Marquee />

        {/* WHAT IT IS */}
        <section className="relative py-24 sm:py-32 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <Reveal>
                <p className="text-xs uppercase tracking-[0.3em] gold-text font-bold">
                  {t('landing.what.label')}
                </p>
                <h2 className="font-display text-4xl sm:text-5xl mt-4 leading-tight">
                  {t('landing.what.title')}{' '}
                  <span className="gold-text">{t('landing.what.titleHighlight')}</span>
                  {t('landing.what.titleEnd')}
                </h2>
                <p className="text-muted-foreground mt-6 text-lg">{t('landing.what.body')}</p>
                <div className="mt-8 flex gap-4">
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 rounded-full gold-gradient px-5 py-3 text-sm font-bold text-stone-900"
                  >
                    {t('landing.what.cta')} <ArrowRight className="size-4" />
                  </Link>
                </div>
              </Reveal>
            </div>
            <div className="lg:col-span-7">
              <Reveal delay={0.15}>
                <div className="grid grid-cols-5 gap-4 h-[460px]">
                  <div className="col-span-3 row-span-2">
                    <ParallaxImage src={students} alt={t('landing.what.studentsAlt')} />
                  </div>
                  <div className="col-span-2">
                    <ParallaxImage src={wallet} alt={t('landing.what.walletAlt')} />
                  </div>
                  <div className="col-span-2 glass-card rounded-3xl p-5 flex flex-col justify-between">
                    <CreditCard className="size-7 text-primary" />
                    <div>
                      <p className="font-display text-3xl gold-text">{t('landing.marquee.mpesa')}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        + {t('landing.marquee.orange')}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="relative py-24 sm:py-32 px-4 sm:px-6 border-t border-border/40">
          <div className="max-w-7xl mx-auto">
            <Reveal>
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.3em] gold-text font-bold">
                  {t('landing.features.label')}
                </p>
                <h2 className="font-display text-4xl sm:text-5xl mt-4 leading-tight">
                  {t('landing.features.title')}
                </h2>
                <p className="text-muted-foreground mt-4 text-lg">
                  {t('landing.features.subtitle')}
                </p>
              </div>
            </Reveal>
            <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f, i) => (
                <Reveal key={f.title} delay={(i % 3) * 0.08}>
                  <motion.div
                    whileHover={{ y: -6 }}
                    transition={{ type: "spring", stiffness: 220, damping: 18 }}
                    className="group relative h-full p-7 rounded-3xl bg-card border border-border/60 hover:border-primary/40 overflow-hidden"
                  >
                    <div
                      className="absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                      style={{
                        background:
                          "radial-gradient(400px circle at var(--x,50%) var(--y,0%), color-mix(in oklab, var(--amber-glow) 22%, transparent), transparent 60%)",
                      }}
                    />
                    <div className="size-12 rounded-2xl gold-gradient grid place-items-center text-stone-900 shadow-lg shadow-amber-900/30">
                      <f.icon className="size-5" />
                    </div>
                    <h3 className="font-display text-xl mt-5">{f.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                      {f.desc}
                    </p>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* WHY US */}
        <section className="relative py-24 sm:py-32 px-4 sm:px-6 border-t border-border/40">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <Reveal>
                <p className="text-xs uppercase tracking-[0.3em] gold-text font-bold">
                  {t('landing.why.label')}
                </p>
                <h2 className="font-display text-4xl sm:text-5xl mt-4 leading-tight">
                  {t('landing.why.title')}{' '}
                  <span className="gold-text">{t('landing.why.titleHighlight')}</span>
                  {t('landing.why.titleEnd')}
                </h2>
                <p className="text-muted-foreground mt-6">{t('landing.why.body')}</p>
              </Reveal>
            </div>
            <div className="lg:col-span-8 grid sm:grid-cols-2 gap-5">
              {whyUs.map((w, i) => (
                <Reveal key={w.n} delay={i * 0.08}>
                  <div className="glass-card rounded-3xl p-7 h-full">
                    <p className="font-display text-5xl gold-text">{w.n}</p>
                    <h3 className="font-display text-xl mt-4">{w.t}</h3>
                    <p className="text-sm text-muted-foreground mt-2">{w.d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <HorizontalSteps />

        {/* CTA BANNER */}
        <section className="relative py-24 sm:py-32 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <div className="relative overflow-hidden rounded-[2.5rem] p-10 sm:p-16 text-center glass-card noise">
                <motion.div
                  aria-hidden
                  className="absolute -top-32 left-1/2 -translate-x-1/2 size-[700px] rounded-full blur-3xl opacity-50"
                  style={{
                    background:
                      "radial-gradient(circle, var(--amber-glow), transparent 60%)",
                  }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                <Sparkles className="size-8 mx-auto gold-text" />
                <h2 className="relative font-display text-4xl sm:text-6xl mt-6 leading-tight">
                  {t('landing.cta.title')}{' '}
                  <span className="gold-text">{t('landing.cta.titleHighlight')}</span>
                  {t('landing.cta.titleEnd')}
                </h2>
                <p className="relative text-muted-foreground mt-6 max-w-xl mx-auto text-lg">
                  {t('landing.cta.body')}
                </p>
                <div className="relative mt-10 flex flex-wrap justify-center gap-4">
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 rounded-full gold-gradient px-7 py-4 text-sm font-bold text-stone-900 shadow-xl shadow-amber-900/40 hover:scale-105 transition-transform"
                  >
                    {t('landing.cta.primary')}
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 backdrop-blur px-7 py-4 text-sm font-semibold hover:bg-surface-2 transition-colors"
                  >
                    {t('landing.cta.secondary')}
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p className="uppercase tracking-[0.25em]">{t('landing.footer.tagline')}</p>
          <div className="flex gap-6">
            <Link to="/login" className="hover:text-foreground transition-colors">
              {t('landing.footer.signIn')}
            </Link>
            <Link to="/register" className="hover:text-foreground transition-colors">
              {t('landing.footer.register')}
            </Link>
            <Link to="/forgot-password" className="hover:text-foreground transition-colors">
              {t('landing.footer.forgotPassword')}
            </Link>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}