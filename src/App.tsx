import { lazy, Suspense, type ReactNode } from 'react'
import { Route, Routes } from 'react-router-dom'
import Footer from './components/Footer'
import Header from './components/Header'
import Accueil from './pages/Accueil'
import Commande from './pages/Commande'
import Panier from './pages/Panier'

/*
 * Back-office chargé à la demande : les visiteuses de la boutique ne téléchargent
 * ni les pages admin, ni leur cadre (RequireAuth, AdminLayout). Vite en fait des
 * fichiers séparés, récupérés seulement quand une route /admin est ouverte.
 */
const RequireAuth = lazy(() => import('./components/admin/RequireAuth'))
const AdminLogin = lazy(() => import('./pages/admin/Login'))
const AdminCommandes = lazy(() => import('./pages/admin/Commandes'))
const AdminProduits = lazy(() => import('./pages/admin/Produits'))

/** Écran affiché le temps de récupérer le code du back-office. */
function ChargementAdmin() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-20 sm:px-8">
      <p className="label text-gris">Chargement…</p>
    </main>
  )
}

/** Toutes les routes /admin passent par ici, pour un seul point de chargement différé. */
function Admin({ children }: { children: ReactNode }) {
  return <Suspense fallback={<ChargementAdmin />}>{children}</Suspense>
}

/** La boutique : header fixe, contenu, pied de page. Le back-office a son propre cadre. */
function Boutique({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Boutique>
            <Accueil />
          </Boutique>
        }
      />
      <Route
        path="/panier"
        element={
          <Boutique>
            <Panier />
          </Boutique>
        }
      />
      <Route
        path="/commande"
        element={
          <Boutique>
            <Commande />
          </Boutique>
        }
      />

      {/* ——— Back-office. RequireAuth ne fait que cacher l'écran : la sécurité vient des politiques RLS. ——— */}
      <Route
        path="/admin/login"
        element={
          <Admin>
            <AdminLogin />
          </Admin>
        }
      />
      <Route
        path="/admin/produits"
        element={
          <Admin>
            <RequireAuth>
              <AdminProduits />
            </RequireAuth>
          </Admin>
        }
      />
      <Route
        path="/admin/*"
        element={
          <Admin>
            <RequireAuth>
              <AdminCommandes />
            </RequireAuth>
          </Admin>
        }
      />

      <Route
        path="*"
        element={
          <Boutique>
            <Accueil />
          </Boutique>
        }
      />
    </Routes>
  )
}
