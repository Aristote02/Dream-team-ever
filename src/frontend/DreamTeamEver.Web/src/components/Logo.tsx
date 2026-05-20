import { motion } from "framer-motion";

export function Logo({ size = 40 }: { size?: number }) {
  return (
    <motion.div
      initial={{ rotate: -10, scale: 0.8, opacity: 0 }}
      animate={{ rotate: 0, scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
      className="relative inline-flex items-center justify-center rounded-xl gold-gradient shadow-lg shadow-amber-900/30 noise"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="text-stone-900 relative z-10"
        style={{ width: size * 0.55, height: size * 0.55 }}
      >
        <path
          d="M12 2 L20 6 V12 C20 17 16 21 12 22 C8 21 4 17 4 12 V6 Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
          fill="rgba(0,0,0,0.08)"
        />
        <path
          d="M9 11 L11 13 L15 9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.div>
  );
}