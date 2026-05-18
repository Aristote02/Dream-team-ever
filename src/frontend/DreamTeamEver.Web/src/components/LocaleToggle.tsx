import { useLocale } from '../i18n/LocaleProvider'

type LocaleToggleProps = {
  className?: string
}

export function LocaleToggle({ className }: LocaleToggleProps) {
  const { locale, setLocale, t } = useLocale()

  return (
    <div
      role="group"
      aria-label={locale === 'en' ? t('locale.switchToFr') : t('locale.switchToEn')}
      className={`inline-flex overflow-hidden rounded-full border border-stone-200 bg-white/90 text-xs font-semibold shadow-sm backdrop-blur dark:border-stone-700 dark:bg-stone-900/90 ${className ?? ''}`}
    >
      <button
        type="button"
        onClick={() => setLocale('en')}
        aria-pressed={locale === 'en'}
        className={
          locale === 'en'
            ? 'bg-amber-500 px-3 py-1.5 text-white'
            : 'px-3 py-1.5 text-stone-600 hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-stone-800'
        }
      >
        {t('locale.en')}
      </button>
      <button
        type="button"
        onClick={() => setLocale('fr')}
        aria-pressed={locale === 'fr'}
        className={
          locale === 'fr'
            ? 'bg-amber-500 px-3 py-1.5 text-white'
            : 'px-3 py-1.5 text-stone-600 hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-stone-800'
        }
      >
        {t('locale.fr')}
      </button>
    </div>
  )
}
