import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { ThemeToggle } from './ThemeToggle'
import './Layout.css'

export function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleSignOut() {
    void logout().finally(() => navigate('/login'))
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/home" className="app-brand">
          Payments
        </Link>
        <nav className="app-nav">
          <ThemeToggle className="app-theme-toggle" />
          {user ? (
            <>
              <span className="app-nav-user" title={user.email}>
                {user.displayName}
              </span>
              <button type="button" className="app-nav-btn" onClick={handleSignOut}>
                Sign out
              </button>
            </>
          ) : (
            <Link to="/login">Sign in</Link>
          )}
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
