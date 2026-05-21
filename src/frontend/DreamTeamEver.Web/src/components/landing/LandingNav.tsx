import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLocale } from "@/i18n/LocaleProvider";
import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/Logo";
import { brandNameParts } from "@/components/auth/brandNameParts";
import { useTheme } from "@/theme/ThemeProvider";
import "./landing-nav.css";

function LangSwitch() {
  const { locale, setLocale } = useLocale();
  return (
    <div className="flex shrink-0 rounded-full border border-border/60 bg-surface/70 p-0.5 backdrop-blur sm:p-1">
      {(["en", "fr"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors sm:px-3 sm:py-1 sm:text-xs ${
            locale === l
              ? "gold-gradient text-stone-900"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="grid size-8 shrink-0 place-items-center rounded-full border border-border/60 bg-surface/70 text-muted-foreground backdrop-blur transition-colors hover:text-foreground sm:size-9"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="inline-flex"
        >
          {theme === "dark" ? <Sun className="size-3.5 sm:size-4" /> : <Moon className="size-3.5 sm:size-4" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

export function LandingNav() {
  const { t } = useLocale();
  const brand = brandNameParts(t("brand.name"), { nonBreakingMain: true });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`landing-nav${scrolled ? " is-scrolled" : ""}`}
      aria-label="Main navigation"
    >
      <div className="landing-nav-inner">
        <Link
          to="/"
          className="landing-nav-brand-link"
          aria-label={t("brand.name")}
        >
          <Logo size={32} />
          <span className="landing-nav-brand">
            <span className="landing-nav-brand-main">{brand.main}</span>
            <span className="landing-nav-brand-accent">{brand.accent}</span>
          </span>
        </Link>

        <div className="landing-nav-actions">
          <LangSwitch />
          <ThemeToggle />
          <Link
            to="/login"
            className="hidden px-2 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            {t("landing.nav.signIn")}
          </Link>
          <Link
            to="/register"
            className="inline-flex shrink-0 items-center rounded-full gold-gradient px-3 py-1.5 text-[10px] font-bold text-stone-900 shadow-lg shadow-amber-900/30 transition-transform hover:scale-105 sm:gap-2 sm:px-4 sm:py-2 sm:text-xs"
          >
            <span className="landing-nav-join-short">{t("landing.nav.joinShort")}</span>
            <span className="landing-nav-join-full">{t("landing.nav.joinNow")}</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
