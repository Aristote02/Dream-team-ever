import { useLocale } from "@/i18n/LocaleProvider";
import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";
import { useTheme } from "@/theme/ThemeProvider";
import { Logo } from "./Logo";

function MiniControls() {
  const { locale, setLocale } = useLocale();
  const { theme, toggle } = useTheme();
  const current = locale;
  return (
    <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 z-10">
      <div className="flex bg-surface/80 backdrop-blur rounded-full p-1 border border-border/60">
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
      <button
        onClick={toggle}
        aria-label="Toggle theme"
        className="size-9 grid place-items-center rounded-full bg-surface/80 backdrop-blur border border-border/60 text-muted-foreground hover:text-foreground transition-colors"
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
    </div>
  );
}

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { t } = useLocale();
  return (
    <div className="relative min-h-screen mesh-bg flex flex-col items-center justify-center px-4 py-12">
      <MiniControls />

      {/* Decorative ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <motion.div
          className="absolute -top-32 left-1/2 -translate-x-1/2 size-[600px] rounded-full opacity-30 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(245,158,11,0.4) 0%, transparent 70%)",
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
        className="w-full max-w-md glass-card rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center text-center gap-4 mb-8">
          <Logo size={56} />
          <div className="space-y-2">
            <h1 className="font-display text-3xl">
              {t("brand.name").split(" ").slice(0, 2).join(" ")}{" "}
              <span className="gold-text font-bold italic">
                {t("brand.name").split(" ").slice(2).join(" ")}
              </span>
            </h1>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              {t("brand.tagline")}
            </p>
          </div>
          <div className="pt-4 space-y-1">
            <h2 className="font-display text-xl">{title}</h2>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>

        {children}

        {footer && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {footer}
          </div>
        )}
      </motion.div>
    </div>
  );
}