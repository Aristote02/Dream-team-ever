import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { useLocale } from '../i18n/LocaleProvider'
import { LocaleToggle } from './LocaleToggle'
import { ThemeToggle } from './ThemeToggle'
import './Layout.css'

export function Layout() {
  const { user, logout } = useAuth()
  const { t } = useLocale()
  const navigate = useNavigate()

  function handleSignOut() {
    void logout().finally(() => navigate('/login'))
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/home" className="app-brand">
          {t('layout.payments')}
        </Link>
        <nav className="app-nav">
          <LocaleToggle className="app-theme-toggle" />
          <ThemeToggle className="app-theme-toggle" />
          {user ? (
            <>
              <span className="app-nav-user" title={user.email}>
                {user.displayName}
              </span>
              <button type="button" className="app-nav-btn" onClick={handleSignOut}>
                {t('common.signOut')}
              </button>
            </>
          ) : (
            <Link to="/login">{t('common.signIn')}</Link>
          )}
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
