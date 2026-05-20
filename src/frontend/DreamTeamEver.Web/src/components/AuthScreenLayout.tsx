import type { ReactNode } from 'react'
import '../auth/auth-screen.css'
import { useLocale } from '../i18n/LocaleProvider'
import { brandNameParts } from './auth/brandNameParts'
import { BrandLogo } from './BrandLogo'
import { LocaleToggle } from './LocaleToggle'
import { ThemeToggle } from './ThemeToggle'

export type AuthScreenLayoutProps = {
  title: string
  lead: string
  children: ReactNode
  footer?: ReactNode
  demoNote?: string
}

export function AuthScreenLayout({ title, lead, children, footer, demoNote }: AuthScreenLayoutProps) {
  const { t } = useLocale()
  const brand = brandNameParts(t('brand.name'))

  return (
    <div className="auth-screen">
      <div className="auth-screen-toolbar">
        <LocaleToggle />
        <ThemeToggle />
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
          <p className="auth-screen-lead">{lead}</p>

          {children}

          {footer ? <div className="auth-footer">{footer}</div> : null}
        </div>

        {demoNote ? <p className="auth-screen-demo">{demoNote}</p> : null}
      </div>
    </div>
  )
}
