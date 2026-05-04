import type { ReactNode } from 'react'

const LOGO_SRC = '/brand-logo.png'

type AuthScreenLayoutProps = {
  subtitle: string
  children: ReactNode
}

export function AuthScreenLayout({ subtitle, children }: AuthScreenLayoutProps) {
  return (
    <div className="font-dream-sans fixed inset-0 z-10 overflow-y-auto bg-white">
      <div className="flex min-h-full flex-col items-center justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-md rounded-2xl border border-amber-200/60 bg-white p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.12)] sm:p-10">
          <div className="mb-8 flex flex-col items-center text-center">
            <img
              src={LOGO_SRC}
              alt="The Dream Team Ever"
              className="h-36 w-auto max-w-full object-contain sm:h-40"
            />
            <h1 className="font-dream-serif mt-6 text-2xl font-semibold tracking-tight text-stone-900 sm:text-[1.65rem]">
              The Dream Team Ever
            </h1>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-stone-500">
              {subtitle}
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
