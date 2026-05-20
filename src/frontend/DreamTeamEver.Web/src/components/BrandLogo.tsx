import { useTheme } from '@/theme/ThemeProvider'

type BrandLogoProps = {
  className?: string
  alt?: string
}

/** Gold crest on white — for light mode */
const LOGO_LIGHT = '/brand-logo.png'
/** Gold crest on dark — for dark mode */
const LOGO_DARK = '/brand-logo-dark.png'

export function BrandLogo({
  className = '',
  alt = 'The Dream Team Ever',
}: BrandLogoProps) {
  const { theme } = useTheme()
  const src = theme === 'dark' ? LOGO_DARK : LOGO_LIGHT

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      width={512}
      height={512}
      decoding="async"
    />
  )
}
