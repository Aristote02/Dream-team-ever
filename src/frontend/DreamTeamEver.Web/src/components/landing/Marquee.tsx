import { motion } from "framer-motion";

const items = [
  "Digital Wallet",
  "★",
  "Official Matricule",
  "★",
  "M-Pesa",
  "★",
  "Orange Money",
  "★",
  "Bilingual EN / FR",
  "★",
  "Bank-Grade Security",
  "★",
  "Kinshasa · 2025",
  "★",
];

export function Marquee() {
  const loop = [...items, ...items, ...items];
  return (
    <section className="relative py-12 border-y border-border/40 overflow-hidden bg-background/40 backdrop-blur-sm">
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: ["0%", "-33.333%"] }}
        transition={{ duration: 30, ease: "linear", repeat: Infinity }}
      >
        {loop.map((t, i) => (
          <span
            key={i}
            className={`font-display text-3xl sm:text-5xl tracking-tight ${
              t === "★" ? "gold-text" : "text-foreground/80"
            }`}
          >
            {t}
          </span>
        ))}
      </motion.div>
    </section>
  );
}