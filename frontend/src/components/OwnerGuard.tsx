import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'

/**
 * Enforces owner access for the operations console. The sign-in screen lives on
 * its own route (/owner/login); this guard only redirects unauthenticated visits.
 */
export function OwnerGuard({ children }: { children: ReactNode }) {
  const { isOwnerAuthenticated } = useStore()

  if (!isOwnerAuthenticated) {
    return <Navigate to="/owner/login" replace />
  }

  return <>{children}</>
}
