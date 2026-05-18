type BrandLogoProps = {
  className?: string
  alt?: string
}

const LOGO_LIGHT = '/brand-logo.png'
const LOGO_DARK = '/brand-logo-dark.png'

export function BrandLogo({
  className = '',
  alt = 'The Dream Team Ever',
}: BrandLogoProps) {
  return (
    <>
      <img
        src={LOGO_LIGHT}
        alt={alt}
        className={`dark:hidden ${className}`}
      />
      <img
        src={LOGO_DARK}
        alt={alt}
        className={`hidden dark:block ${className}`}
      />
    </>
  )
}
