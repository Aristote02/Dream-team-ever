import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { Link } from "react-router-dom";
import { useRef, type MouseEvent } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { useLocale } from "@/i18n/LocaleProvider";
import { Hero3DScene } from "./Hero3DScene";

export function Hero3D() {
  const { t } = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const cardRotateScroll = useTransform(scrollYProgress, [0, 1], [0, 30]);

  // mouse parallax
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [12, -12]), { stiffness: 120, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-18, 18]), { stiffness: 120, damping: 18 });

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen items-center overflow-hidden pt-[calc(4.25rem+env(safe-area-inset-top,0px))] sm:pt-[calc(5rem+env(safe-area-inset-top,0px))]"
    >
      {/* animated mesh orbs */}
      <motion.div
        aria-hidden
        className="absolute -top-32 -left-32 size-[520px] rounded-full blur-3xl opacity-50"
        style={{ background: "radial-gradient(circle, var(--amber-glow), transparent 60%)" }}
        animate={{ x: [0, 60, 0], y: [0, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute bottom-0 right-0 size-[600px] rounded-full blur-3xl opacity-40"
        style={{ background: "radial-gradient(circle, var(--violet-soft), transparent 60%)" }}
        animate={{ x: [0, -50, 0], y: [0, -40, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        style={{ y, opacity }}
        className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-center"
      >
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold gold-text"
          >
            <Sparkles className="size-3.5" />
            {t("landing.hero.badge")}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="font-display text-5xl sm:text-6xl lg:text-7xl mt-6 leading-[1.05] tracking-tight"
          >
            {t("landing.hero.title")}{" "}
            <span className="gold-text">{t("landing.hero.titleHighlight")}</span>
            <br />
            {t("landing.hero.titleEnd")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-muted-foreground text-lg mt-6 max-w-lg"
          >
            {t("landing.hero.lead")}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 rounded-full gold-gradient px-6 py-3.5 text-sm font-bold text-stone-900 shadow-xl shadow-amber-900/30 hover:scale-105 transition-transform"
            >
              {t("landing.hero.ctaPrimary")}
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 backdrop-blur px-6 py-3.5 text-sm font-semibold hover:bg-surface-2 transition-colors"
            >
              {t("landing.hero.ctaSecondary")}
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-12 flex items-center gap-6 text-xs text-muted-foreground"
          >
            <div>
              <p className="font-display text-2xl gold-text">{t("landing.hero.statMembersValue")}</p>
              <p className="uppercase tracking-widest mt-1">{t("landing.hero.statMembers")}</p>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <p className="font-display text-2xl gold-text">{t("landing.hero.statUptimeValue")}</p>
              <p className="uppercase tracking-widest mt-1">{t("landing.hero.statUptime")}</p>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <p className="font-display text-2xl gold-text">{t("landing.hero.statSupportValue")}</p>
              <p className="uppercase tracking-widest mt-1">{t("landing.hero.statSupport")}</p>
            </div>
          </motion.div>
        </div>

        {/* 3D scene + floating membership card */}
        <div
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          className="relative h-[480px] sm:h-[600px] [perspective:1600px]"
        >
          {/* R3F canvas backdrop */}
          <div className="absolute inset-0">
            <Hero3DScene />
          </div>

          {/* Foreground tilting card */}
          <motion.div
            style={{
              rotateX: rx,
              rotateY: ry,
              transformStyle: "preserve-3d",
            }}
            initial={{ opacity: 0, scale: 0.85, rotateY: -30 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.9, ease: [0.32, 0.72, 0, 1] }}
            className="absolute inset-0 m-auto w-[300px] sm:w-[380px] h-[190px] sm:h-[240px] pointer-events-none"
          >
            <motion.div
              style={{ rotate: cardRotateScroll }}
              className="relative size-full rounded-3xl gold-gradient p-6 shadow-2xl shadow-amber-900/60 noise shimmer overflow-hidden ring-1 ring-amber-100/30"
            >
              <div className="flex items-start justify-between text-stone-900">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] opacity-70">
                    {t("landing.hero.cardMembership")}
                  </p>
                  <p className="font-display text-xl mt-1">{t("brand.name")}</p>
                </div>
                <div className="size-9 rounded-lg bg-stone-900/15 grid place-items-center">
                  <svg viewBox="0 0 24 24" className="size-5 text-stone-900" fill="none">
                    <path
                      d="M12 2 L20 6 V12 C20 17 16 21 12 22 C8 21 4 17 4 12 V6 Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </svg>
                </div>
              </div>
              <div className="absolute bottom-6 left-6 right-6 text-stone-900">
                <p className="text-[10px] uppercase tracking-[0.25em] opacity-70">
                  {t("landing.hero.cardMatricule")}
                </p>
                <p className="font-display text-2xl tracking-widest mt-1">
                  DTE · 2025 · 0042
                </p>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-4 sm:-right-12 glass-card rounded-2xl px-4 py-3 text-xs"
              style={{ transform: "translateZ(60px)" }}
            >
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {t("landing.hero.cardStatus")}
              </p>
              <p className="font-bold text-success mt-1 flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-success animate-pulse" />
                {t("landing.hero.cardActive")}
              </p>
            </motion.div>
            <motion.div
              animate={{ y: [0, 14, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 -left-4 sm:-left-10 glass-card rounded-2xl px-4 py-3 text-xs"
              style={{ transform: "translateZ(60px)" }}
            >
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {t("landing.hero.cardPaid")}
              </p>
              <p className="font-bold gold-text mt-1">{t("landing.hero.cardPaidMethods")}</p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.3em] text-muted-foreground"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {t("landing.hero.scroll")} ↓
        </motion.div>
      </motion.div>
    </section>
  );
}