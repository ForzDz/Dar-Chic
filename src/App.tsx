import type { ReactNode } from 'react'
import { Route, Routes } from 'react-router-dom'
import Footer from './components/Footer'
import Header from './components/Header'
import RequireAuth from './components/admin/RequireAuth'
import Accueil from './pages/Accueil'
import Commande from './pages/Commande'
import Panier from './pages/Panier'
import AdminCommandes from './pages/admin/Commandes'
import AdminLogin from './pages/admin/Login'
import AdminProduits from './pages/admin/Produits'

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
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/produits"
        element={
          <RequireAuth>
            <AdminProduits />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/*"
        element={
          <RequireAuth>
            <AdminCommandes />
          </RequireAuth>
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
