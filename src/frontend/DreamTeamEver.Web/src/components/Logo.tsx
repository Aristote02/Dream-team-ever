import { motion } from 'framer-motion'
import { BrandLogo } from './BrandLogo'

export function Logo({ size = 40 }: { size?: number }) {
  return (
    <motion.div
      initial={{ rotate: -10, scale: 0.8, opacity: 0 }}
      animate={{ rotate: 0, scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 18 }}
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      <BrandLogo className="h-full w-full object-contain" />
    </motion.div>
  )
}
