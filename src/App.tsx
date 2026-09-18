import { Route, Routes } from 'react-router-dom'
import Footer from './components/Footer'
import Header from './components/Header'
import Accueil from './pages/Accueil'
import Commande from './pages/Commande'
import Panier from './pages/Panier'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/panier" element={<Panier />} />
          <Route path="/commande" element={<Commande />} />
          <Route path="*" element={<Accueil />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
