import { useLocale } from '../i18n/LocaleProvider'
import { useTheme } from '../theme/ThemeProvider'

type ThemeToggleProps = {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const { t } = useLocale()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? t('theme.switchToLight') : t('theme.switchToDark')}
      className={`inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/90 px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-sm backdrop-blur transition hover:bg-white dark:border-stone-700 dark:bg-stone-900/90 dark:text-stone-200 dark:hover:bg-stone-900 ${className ?? ''}`}
    >
      <span aria-hidden="true">{isDark ? '☀️' : '🌙'}</span>
      <span>{isDark ? t('theme.light') : t('theme.dark')}</span>
    </button>
  )
}
