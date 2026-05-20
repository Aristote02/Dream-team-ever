import { Link, useNavigate } from "react-router-dom";
import { useLocale } from "@/i18n/LocaleProvider";
import { Moon, Sun, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, type ReactNode } from "react";
import { useAuth } from "@/auth/useAuth";
import { useTheme } from "@/theme/ThemeProvider";
import { Logo } from "./Logo";

function LangSwitch() {
  const { locale, setLocale } = useLocale();
  return (
    <div className="flex bg-surface rounded-full p-1 border border-border/60">
      {(["en", "fr"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
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
      onClick={toggle}
      aria-label="Toggle theme"
      className="size-9 grid place-items-center rounded-full bg-surface border border-border/60 text-muted-foreground hover:text-foreground transition-colors"
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

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useLocale();
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  const initials = (user?.displayName || user?.email || "?")
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await logout();
      navigate("/login");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="min-h-screen mesh-bg flex flex-col">
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
          <Link
            to={isAdmin ? "/students" : "/home"}
            className="flex items-center gap-3"
          >
            <Logo size={36} />
            <span className="font-display text-lg sm:text-xl tracking-tight hidden sm:block">
              {t("brand.name").split(" ").slice(0, 2).join(" ")}{" "}
              <span className="gold-text font-bold">
                {t("brand.name").split(" ").slice(2).join(" ")}
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <LangSwitch />
            <ThemeToggle />
            <div className="h-6 w-px bg-border hidden sm:block" />
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold leading-none">
                  {user?.displayName || user?.email}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                  {isAdmin ? t("nav.admin") : t("nav.member")}
                </p>
              </div>
              <div className="size-9 rounded-full border-2 border-primary/40 p-0.5">
                <div className="size-full rounded-full bg-surface-2 grid place-items-center text-xs font-bold gold-text">
                  {initials}
                </div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              aria-label={t("nav.signOut")}
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">{t("nav.signOut")}</span>
            </button>
          </div>
        </div>
      </nav>

      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 flex-1"
      >
        {children}
      </motion.main>

      <footer className="border-t border-border/40 py-8 text-center text-muted-foreground text-xs">
        <p className="uppercase tracking-[0.25em]">
          {t("brand.name")} · {t("brand.tagline")}
        </p>
      </footer>
    </div>
  );
}
