import { useEffect, useRef } from 'react'
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
const students = '/landing-students.png';
const wallet = '/landing-wallet.png';

const features = [
  {
    icon: ShieldCheck,
    title: "Official matricule",
    desc: "A unique, verifiable member ID issued the moment your payment clears.",
  },
  {
    icon: Smartphone,
    title: "Digital wallet",
    desc: "Your membership card, profile and full payment history — always in your pocket.",
  },
  {
    icon: Zap,
    title: "Instant payments",
    desc: "Pay via M-Pesa or Orange Money. No queues, no paperwork, no waiting.",
  },
  {
    icon: Globe2,
    title: "Bilingual by design",
    desc: "Fully crafted for English and French speakers across DRC and beyond.",
  },
  {
    icon: Lock,
    title: "Bank-grade security",
    desc: "Encrypted sessions, hashed credentials, and secure password recovery flows.",
  },
  {
    icon: Users,
    title: "Built for the team",
    desc: "Admin tools to manage members, ledgers, and verify matricules in one click.",
  },
];

const whyUs = [
  { n: "01", t: "Built for Kinshasa", d: "Designed around local payment rails and bilingual realities." },
  { n: "02", t: "Crafted experience", d: "An interface that feels premium on every screen, mobile or desktop." },
  { n: "03", t: "Truly your data", d: "You own your matricule, your records, and every transaction." },
  { n: "04", t: "Always available", d: "Your wallet is accessible 24/7, from anywhere with a connection." },
];

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
                  What is Dream Team Ever
                </p>
                <h2 className="font-display text-4xl sm:text-5xl mt-4 leading-tight">
                  More than a registry. A <span className="gold-text">community</span>.
                </h2>
                <p className="text-muted-foreground mt-6 text-lg">
                  Dream Team Ever turns paper registration into a polished digital experience.
                  Members pay once, receive their lifetime matricule, and unlock a private
                  wallet to track everything — profile, payments, status.
                </p>
                <div className="mt-8 flex gap-4">
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 rounded-full gold-gradient px-5 py-3 text-sm font-bold text-stone-900"
                  >
                    Start now <ArrowRight className="size-4" />
                  </Link>
                </div>
              </Reveal>
            </div>
            <div className="lg:col-span-7">
              <Reveal delay={0.15}>
                <div className="grid grid-cols-5 gap-4 h-[460px]">
                  <div className="col-span-3 row-span-2">
                    <ParallaxImage src={students} alt="Dream Team Ever members" />
                  </div>
                  <div className="col-span-2">
                    <ParallaxImage src={wallet} alt="Digital membership wallet" />
                  </div>
                  <div className="col-span-2 glass-card rounded-3xl p-5 flex flex-col justify-between">
                    <CreditCard className="size-7 text-primary" />
                    <div>
                      <p className="font-display text-3xl gold-text">M-Pesa</p>
                      <p className="text-xs text-muted-foreground mt-1">+ Orange Money</p>
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
                  Features
                </p>
                <h2 className="font-display text-4xl sm:text-5xl mt-4 leading-tight">
                  Everything a modern member needs.
                </h2>
                <p className="text-muted-foreground mt-4 text-lg">
                  Designed for clarity, built for trust.
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
                  Why us
                </p>
                <h2 className="font-display text-4xl sm:text-5xl mt-4 leading-tight">
                  Crafted with <span className="gold-text">care</span>, deployed with pride.
                </h2>
                <p className="text-muted-foreground mt-6">
                  We obsess over the small details — the shimmer of your matricule, the
                  smoothness of every transition, the trust in every transaction.
                </p>
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
                  Ready to claim your <span className="gold-text">matricule</span>?
                </h2>
                <p className="relative text-muted-foreground mt-6 max-w-xl mx-auto text-lg">
                  Register in under two minutes. Pay the fee. Walk away with your digital
                  membership for life.
                </p>
                <div className="relative mt-10 flex flex-wrap justify-center gap-4">
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 rounded-full gold-gradient px-7 py-4 text-sm font-bold text-stone-900 shadow-xl shadow-amber-900/40 hover:scale-105 transition-transform"
                  >
                    Create your account
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 backdrop-blur px-7 py-4 text-sm font-semibold hover:bg-surface-2 transition-colors"
                  >
                    Sign in
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p className="uppercase tracking-[0.25em]">
            Dream Team Ever · Kinshasa · Estd 2025
          </p>
          <div className="flex gap-6">
            <Link to="/login" className="hover:text-foreground transition-colors">
              Sign in
            </Link>
            <Link to="/register" className="hover:text-foreground transition-colors">
              Register
            </Link>
            <Link to="/forgot-password" className="hover:text-foreground transition-colors">
              Forgot password
            </Link>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}