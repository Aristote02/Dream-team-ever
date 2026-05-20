import type { ReactNode } from 'react'
import { Moon, Sun } from 'lucide-react'
import '../auth/auth-screen.css'
import { useLocale } from '@/i18n/LocaleProvider'
import { useTheme } from '@/theme/ThemeProvider'
import { brandNameParts } from './auth/brandNameParts'
import { BrandLogo } from './BrandLogo'
import { LocaleToggle } from './LocaleToggle'

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  demoNote,
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
  demoNote?: string
}) {
  const { t } = useLocale()
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const brand = brandNameParts(t('brand.name'))

  return (
    <div className="auth-screen">
      <div className="auth-screen-toolbar">
        <LocaleToggle className="auth-locale-toggle" />
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? t('theme.switchToLight') : t('theme.switchToDark')}
          className="auth-theme-toggle"
        >
          {isDark ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
        </button>
      </div>

      <div className="auth-screen-inner">
        <div className="auth-screen-card">
          <div className="auth-screen-brand">
            <div className="auth-screen-logo-ring">
              <BrandLogo className="auth-screen-logo-img" alt="" />
            </div>
            <p className="auth-brand-title">
              {brand.main}{' '}
              <span className="auth-brand-accent">{brand.accent}</span>
            </p>
            <p className="auth-screen-tagline">{t('brand.tagline')}</p>
          </div>

          <h2 className="auth-screen-heading">{title}</h2>
          <p className="auth-screen-lead">{subtitle}</p>

          {children}

          {demoNote ? <p className="auth-screen-demo">{demoNote}</p> : null}

          {footer ? <div className="auth-footer">{footer}</div> : null}
        </div>
      </div>
    </div>
  )
}
