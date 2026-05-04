import { Link } from 'react-router-dom'
import './Pages.css'

export function PaymentCancelPage() {
  return (
    <div className="page-stack">
      <h1 className="page-title">Payment cancelled</h1>
      <p className="page-lead">
        No charge was completed. You can return to checkout when you are ready.
      </p>
      <Link to="/checkout" className="btn-primary">
        Try again
      </Link>
    </div>
  )
}
