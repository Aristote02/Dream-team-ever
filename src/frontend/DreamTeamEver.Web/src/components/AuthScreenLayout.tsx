import type { ReactNode } from 'react'
import { useLocale } from '../i18n/LocaleProvider'
import { BrandLogo } from './BrandLogo'
import { LocaleToggle } from './LocaleToggle'
import { ThemeToggle } from './ThemeToggle'

type AuthScreenLayoutProps = {
  subtitle: string
  children: ReactNode
}

export function AuthScreenLayout({ subtitle, children }: AuthScreenLayoutProps) {
  const { t } = useLocale()
  return (
    <div className="font-dream-sans fixed inset-0 z-10 overflow-y-auto bg-white dark:bg-black">
      <div className="absolute right-3 top-3 z-20 flex items-center gap-2 sm:right-5 sm:top-5">
        <LocaleToggle />
        <ThemeToggle />
      </div>
      <div className="flex min-h-full flex-col items-center justify-center px-3 py-4 sm:px-4 sm:py-14">
        <div className="w-full max-w-sm rounded-2xl border border-amber-200/60 bg-white p-5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.12)] dark:border-stone-800 dark:bg-black sm:max-w-md sm:p-10">
          <div className="mb-5 flex flex-col items-center text-center sm:mb-8">
            <div className="flex w-full justify-center dark:rounded-xl dark:bg-black">
              <BrandLogo className="h-20 w-auto max-w-full object-contain sm:h-40" />
            </div>
            <h1 className="font-dream-serif mt-3 max-w-full text-balance text-[clamp(1.55rem,8vw,2.1rem)] font-semibold leading-[1.05] tracking-tight text-stone-900 dark:text-stone-100 sm:mt-6 sm:text-[2.1rem]">
              {t('appName')}
            </h1>
            <p className="mt-1 max-w-sm text-xs leading-relaxed text-stone-500 dark:text-stone-400 sm:mt-2 sm:text-sm">
              {subtitle}
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
