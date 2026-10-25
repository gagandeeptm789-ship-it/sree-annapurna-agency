import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock, ShieldCheck, Truck } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { Notice } from '../components/common'

export function OwnerLoginPage() {
  const { isOwnerAuthenticated, loginOwner, notify } = useStore()
  const navigate = useNavigate()
  const [passcode, setPasscode] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isOwnerAuthenticated) {
    return <Navigate to="/admin" replace />
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    if (!passcode.trim()) {
      setError('Please enter the owner access passcode.')
      return
    }
    setLoading(true)
    try {
      const success = await Promise.resolve(loginOwner(passcode))
      if (success) {
        notify('Authenticated as Agency Owner.')
        navigate('/admin')
      } else {
        setError('Invalid passcode or unable to reach the owner authentication service.')
      }
    } catch {
      setError('Authentication service error. Please verify the server is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="owner-auth-shell">
      <aside className="owner-auth-context">
        <div className="owner-auth-brand">
          <div className="owner-brand-row">
            <Link className="brand-lockup" to="/" aria-label="Sree Annapurna Agency home">
              <span className="brand-mark" aria-hidden="true">
                <span>SA</span>
              </span>
              <span className="brand-wordmark">
                <strong>SREE ANNAPURNA</strong>
                <small>Agency · wholesale &amp; distribution</small>
              </span>
            </Link>
            <span className="owner-auth-badge">
              <Lock size={12} aria-hidden="true" /> Restricted
            </span>
          </div>
        </div>

        <div className="owner-signin-copy">
          <h2 className="owner-signin-title">Agency operations, kept separate from the storefront.</h2>
          <p>
            Order queues, dispatch status and the product catalogue are managed here by the agency owner. Customer
            shopping accounts do not have access to this workspace.
          </p>
          <ul className="owner-feature-list">
            <li>
              <Truck size={15} aria-hidden="true" /> Review incoming orders and update dispatch status
            </li>
            <li>
              <ShieldCheck size={15} aria-hidden="true" /> Maintain stock levels and packaging images
            </li>
          </ul>
        </div>
      </aside>

      <div className="owner-auth-form-wrap">
        <div className="owner-login-card">
          <div className="owner-login-header">
            <p className="eyebrow">Owner portal</p>
            <h1 className="owner-login-heading">Owner sign in</h1>
            <p className="owner-login-sub">
              Enter the agency owner passcode to open the operations panel.
            </p>
          </div>

          <form className="form-stack" onSubmit={handleSubmit}>
            <div className="owner-field">
              <label className="owner-label" htmlFor="owner-passcode">
                Owner passcode
              </label>
              <div className={`owner-pass-field ${error ? 'is-invalid' : ''}`}>
                <input
                  id="owner-passcode"
                  type={showPass ? 'text' : 'password'}
                  value={passcode}
                  onChange={(event) => {
                    setPasscode(event.target.value)
                    setError('')
                  }}
                  placeholder="Enter owner passcode"
                  autoComplete="current-password"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? 'owner-passcode-error' : undefined}
                  autoFocus
                />
                <button
                  type="button"
                  className="owner-pass-toggle"
                  onClick={() => setShowPass((visible) => !visible)}
                  aria-label={showPass ? 'Hide passcode' : 'Show passcode'}
                >
                  {showPass ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
                  <span>{showPass ? 'Hide' : 'Show'}</span>
                </button>
              </div>
            </div>

            {error && (
              <p className="form-error" id="owner-passcode-error" role="alert">
                {error}
              </p>
            )}

            <div className="owner-submit-row">
              <button type="submit" className="button button-primary full-button" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span>{loading ? 'Verifying passcode...' : 'Sign in to owner panel'}</span>
                {!loading && <ArrowRight size={16} aria-hidden="true" />}
              </button>
              <Link to="/" className="owner-back-link">
                <ArrowLeft size={15} aria-hidden="true" /> Return to store
              </Link>
            </div>
          </form>

          <p className="owner-auth-footnote">
            Owner access is verified by the backend. Keep the configured passcode private.
          </p>
        </div>
      </div>

      <Notice />
    </div>
  )
}
