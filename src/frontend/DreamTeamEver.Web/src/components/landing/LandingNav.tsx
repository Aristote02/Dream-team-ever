import { Link } from 'react-router-dom'
import { BrandLogo } from '../BrandLogo'
import { LocaleToggle } from '../LocaleToggle'
import { ThemeToggle } from '../ThemeToggle'
import { useLocale } from '../../i18n/LocaleProvider'

export function LandingNav() {
  const { t } = useLocale()

  return (
    <header className="l-nav sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <BrandLogo className="h-9 w-auto" alt="" />
          <span className="font-display l-heading hidden truncate text-sm font-semibold sm:block">
            {t('appName')}
          </span>
        </Link>
        <nav className="flex shrink-0 items-center gap-2 sm:gap-3">
          <LocaleToggle />
          <ThemeToggle />
          <Link
            to="/login"
            className="l-link hidden text-sm font-medium transition sm:inline"
          >
            {t('common.signIn')}
          </Link>
          <Link
            to="/register"
            className="rounded-full gold-gradient px-4 py-2 text-xs font-bold text-stone-900 shadow-lg shadow-amber-900/30 transition hover:brightness-110 sm:px-5 sm:text-sm"
          >
            {t('landing.nav.joinNow')}
          </Link>
        </nav>
      </div>
    </header>
  )
}
