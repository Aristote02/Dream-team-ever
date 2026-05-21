import { useMemo } from "react";
import { motion } from "framer-motion";
import { useLocale } from "@/i18n/LocaleProvider";

export function Marquee() {
  const { t } = useLocale();

  const items = useMemo(
    () => [
      t("landing.marquee.wallet"),
      "★",
      t("landing.marquee.matricule"),
      "★",
      t("landing.marquee.mpesa"),
      "★",
      t("landing.marquee.orange"),
      "★",
      t("landing.marquee.bilingual"),
      "★",
      t("landing.marquee.security"),
      "★",
      t("landing.marquee.location"),
      "★",
    ],
    [t],
  );

  const loop = [...items, ...items, ...items];

  return (
    <section className="relative py-12 border-y border-border/40 overflow-hidden bg-background/40 backdrop-blur-sm">
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: ["0%", "-33.333%"] }}
        transition={{ duration: 30, ease: "linear", repeat: Infinity }}
      >
        {loop.map((item, i) => (
          <span
            key={i}
            className={`font-display text-3xl sm:text-5xl tracking-tight ${
              item === "★" ? "gold-text" : "text-foreground/80"
            }`}
          >
            {item}
          </span>
        ))}
      </motion.div>
    </section>
  );
}
