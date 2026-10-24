import { useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock, ShieldAlert, Sparkles } from 'lucide-react'
import { useStore } from '../context/StoreContext'

export function OwnerGuard({ children }: { children: ReactNode }) {
  const { isOwnerAuthenticated, loginOwner, notify } = useStore()
  const [passcode, setPasscode] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')

  if (isOwnerAuthenticated) {
    return <>{children}</>
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!passcode.trim()) {
      setError('Please enter the owner access passcode.')
      return
    }
    const success = loginOwner(passcode)
    if (success) {
      notify('Authenticated as Agency Owner.')
    } else {
      setError('Invalid passcode. For prototype testing, use "admin123" or click Quick Access below.')
    }
  }

  const handleQuickLogin = () => {
    loginOwner('admin123')
    notify('Authenticated as Agency Owner (Demo Access).')
  }

  return (
    <div className="owner-login-shell">
      <div className="owner-login-container">
        <div className="owner-login-brand">
          <Link to="/" className="brand-lockup">
            <span className="brand-mark">sa<span>.</span></span>
            <span className="brand-wordmark">
              <strong>SREE ANNAPURNA</strong>
              <small>AGENCY</small>
            </span>
          </Link>
        </div>

        <div className="owner-login-card">
          <div className="owner-login-header">
            <div className="owner-login-icon">
              <Lock size={22} />
            </div>
            <p className="eyebrow">Agency Operations</p>
            <h1>Owner Portal</h1>
            <p className="owner-login-desc">
              Restricted management workspace for incoming customer orders, dispatch logistics, and product catalogue management.
            </p>
          </div>

          <div className="owner-security-notice" role="alert">
            <div className="security-notice-badge">
              <ShieldAlert size={16} />
              <span>Security Architecture Notice</span>
            </div>
            <p>
              <strong>Frontend Prototype Authentication:</strong> Owner routes are separated from customer shopping accounts. In production, this gate connects to server-side JWT authentication and strict Role-Based Access Control (RBAC).
            </p>
          </div>

          <form onSubmit={handleSubmit} className="owner-login-form">
            <label className="owner-input-group">
              <span>Owner Passcode</span>
              <div className="password-input-wrapper">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value)
                    setError('')
                  }}
                  placeholder="Enter passcode (e.g. admin123)"
                  autoComplete="current-password"
                  autoFocus
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? 'Hide passcode' : 'Show passcode'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="button button-dark full-button">
              Sign In to Owner Panel
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="owner-demo-quick">
            <div className="demo-divider">
              <span>Demonstration Testing</span>
            </div>
            <button
              type="button"
              className="button button-outline full-button quick-access-button"
              onClick={handleQuickLogin}
            >
              <Sparkles size={16} />
              Demo Owner Quick Access (Passkey: admin123)
            </button>
          </div>

          <div className="owner-login-footer">
            <Link to="/" className="store-return-link">
              <ArrowLeft size={15} />
              Return to Customer Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

