import type { ReactNode } from 'react'
import { ThemeToggle } from './ThemeToggle'

const LOGO_SRC = '/brand-logo.png'

type AuthScreenLayoutProps = {
  subtitle: string
  children: ReactNode
}

export function AuthScreenLayout({ subtitle, children }: AuthScreenLayoutProps) {
  return (
    <div className="font-dream-sans fixed inset-0 z-10 overflow-y-auto bg-white dark:bg-stone-950">
      <div className="absolute right-3 top-3 z-20 sm:right-5 sm:top-5">
        <ThemeToggle />
      </div>
      <div className="flex min-h-full flex-col items-center justify-center px-3 py-4 sm:px-4 sm:py-14">
        <div className="w-full max-w-sm rounded-2xl border border-amber-200/60 bg-white p-5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.12)] dark:border-stone-700 dark:bg-stone-900 sm:max-w-md sm:p-10">
          <div className="mb-5 flex flex-col items-center text-center sm:mb-8">
            <img
              src={LOGO_SRC}
              alt="The Dream Team Ever"
              className="h-20 w-auto max-w-full object-contain sm:h-40"
            />
            <h1 className="font-dream-serif mt-3 max-w-full text-balance text-[clamp(1.55rem,8vw,2.1rem)] font-semibold leading-[1.05] tracking-tight text-stone-900 dark:text-stone-100 sm:mt-6 sm:text-[2.1rem]">
              The Dream Team Ever
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
