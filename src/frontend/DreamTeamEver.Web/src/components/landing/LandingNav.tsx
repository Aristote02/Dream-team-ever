import { Link } from "react-router-dom";
import { useLocale } from "@/i18n/LocaleProvider";
import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/Logo";
import { useTheme } from "@/theme/ThemeProvider";

function LangSwitch() {
  const { locale, setLocale } = useLocale();
  const current = locale;
  return (
    <div className="flex bg-surface/70 backdrop-blur rounded-full p-1 border border-border/60">
      {(["en", "fr"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
            current === l
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
      onClick={toggle}
      aria-label="Toggle theme"
      className="size-9 grid place-items-center rounded-full bg-surface/70 backdrop-blur border border-border/60 text-muted-foreground hover:text-foreground transition-colors"
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
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

export function LandingNav() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3">
          <Logo size={36} />
          <span className="font-display text-lg sm:text-xl tracking-tight">
            Dream Team <span className="gold-text font-bold">Ever</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <LangSwitch />
          <ThemeToggle />
          <Link
            to="/login"
            className="hidden sm:inline-flex text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-full gold-gradient px-4 py-2 text-xs font-bold text-stone-900 shadow-lg shadow-amber-900/30 hover:scale-105 transition-transform"
          >
            Join now
          </Link>
        </div>
      </div>
    </nav>
  );
}