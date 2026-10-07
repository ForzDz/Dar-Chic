import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AdminLayout from './AdminLayout'

/**
 * Garde de route : sans session, on renvoie vers /admin/login.
 * Ce n'est QUE de l'affichage. Tant que les politiques RLS ne sont pas écrites,
 * les tables restent accessibles à qui interroge l'API directement.
 */
export default function RequireAuth({ children }: { children: ReactNode }) {
  const { session, chargement } = useAuth()
  const location = useLocation()

  if (chargement) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-20 sm:px-8">
        <p className="label text-gris">Vérification de la session…</p>
      </main>
    )
  }

  if (!session) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  return <AdminLayout>{children}</AdminLayout>
}
