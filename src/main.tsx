import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { CartProvider } from './context/CartContext'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Le panier est au-dessus du routeur : il traverse les changements de page. */}
    <CartProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </BrowserRouter>
    </CartProvider>
  </StrictMode>,
)
