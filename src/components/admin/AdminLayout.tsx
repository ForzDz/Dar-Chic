import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * Cadre commun aux pages /admin : barre noire, navigation, bouton Déconnexion.
 * Même grammaire visuelle que la boutique (tokens de couleur, labels, boutons pilule).
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  const { session, seDeconnecter } = useAuth()
  const navigate = useNavigate()

  async function deconnexion() {
    await seDeconnecter()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-noir text-blanc">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4 sm:px-8">
          <p className="font-display text-lg font-black uppercase tracking-[-0.04em]">
            Dar Chic <span className="text-blanc/50">Admin</span>
          </p>

          <nav aria-label="Navigation du back-office" className="flex items-center gap-1">
            {[
              { to: '/admin/commandes', libelle: 'Commandes' },
              { to: '/admin/produits', libelle: 'Produits' },
            ].map(({ to, libelle }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  [
                    'dc-focus dc-press label inline-block rounded-full px-4 py-2',
                    isActive ? 'bg-blanc text-noir' : 'text-blanc/70 hover:text-blanc',
                  ].join(' ')
                }
              >
                {libelle}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-4">
            <p className="hidden text-xs text-blanc/60 sm:block">{session?.user.email}</p>
            <button
              type="button"
              onClick={deconnexion}
              className="dc-focus dc-press label rounded-full border border-blanc/30 px-4 py-2 text-blanc hover:border-blanc"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  )
}
