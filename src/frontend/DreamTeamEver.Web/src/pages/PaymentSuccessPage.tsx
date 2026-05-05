import { Link, useSearchParams } from 'react-router-dom'
import './Pages.css'

export function PaymentSuccessPage() {
  const [params] = useSearchParams()
  const sessionId = params.get('session_id') ?? params.get('sessionId')

  return (
    <div className="page-stack">
      <h1 className="page-title">Payment successful</h1>
      <p className="page-lead">
        Thank you. Your provider may append query parameters when redirecting
        back here (for example <code>session_id</code>).
      </p>
      {sessionId ? (
        <p className="page-meta">
          Session reference: <code>{sessionId}</code>
        </p>
      ) : null}
      <Link to="/home" className="btn-secondary">
        Back to home
      </Link>
    </div>
  )
}
