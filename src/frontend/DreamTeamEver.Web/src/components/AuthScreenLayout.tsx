import type { ReactNode } from 'react'
import '../auth/auth-screen.css'
import { useLocale } from '../i18n/LocaleProvider'
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
              <BrandLogo className="h-11 w-auto object-contain dark:hidden" alt="" />
              <BrandLogo className="hidden h-11 w-auto object-contain dark:block" alt="" />
            </div>
            <p className="auth-brand-title">
              {t('auth.brandLine1')}{' '}
              <span className="auth-brand-accent">{t('auth.brandAccent')}</span>
            </p>
            <p className="auth-screen-tagline">{t('auth.tagline')}</p>
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
