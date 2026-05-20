import type { ReactNode } from 'react'

type AuthFormFieldProps = {
  id: string
  label: string
  error?: string
  children: ReactNode
}

export function AuthFormField({ id, label, error, children }: AuthFormFieldProps) {
  return (
    <div className="auth-field">
      <label htmlFor={id} className="auth-label">
        {label}
      </label>
      {children}
      {error ? (
        <p className="auth-field-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
