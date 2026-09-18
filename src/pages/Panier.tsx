import { Link, useNavigate } from 'react-router-dom'
import CartLine from '../components/CartLine'
import Totaux from '../components/Totaux'
import { useCart } from '../context/CartContext'
import { products } from '../data/products'

export default function Panier() {
  const { items, count, subtotal } = useCart()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-8">
        <h1 className="font-display text-3xl font-black uppercase tracking-[-0.05em] sm:text-5xl">
          Panier vide
        </h1>
        <p className="mx-auto mt-4 max-w-[38ch] text-sm leading-relaxed text-gris">
          Rien à livrer pour l’instant. La collection fait{' '}
          <span className="font-mono">{products.length}</span> pièces, ça se regarde en une minute.
        </p>
        <Link
          to="/"
          className="dc-focus dc-press label mt-8 inline-block rounded-full bg-noir px-6 py-3.5 text-blanc hover:bg-noir/85"
        >
          Voir la collection
        </Link>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-8 sm:py-14">
      <div className="flex items-end justify-between gap-4 border-b-2 border-noir pb-4">
        <h1 className="font-display text-3xl font-black uppercase leading-none tracking-[-0.05em] sm:text-5xl">
          Panier
        </h1>
        <p className="label text-gris">
          <span className="font-mono">{count}</span> article{count > 1 ? 's' : ''}
        </p>
      </div>

      <div className="gap-12 lg:grid lg:grid-cols-[1fr_22rem] lg:items-start">
        <ul>
          {items.map((line) => (
            <CartLine key={line.product.id} line={line} />
          ))}
        </ul>

        <aside className="mt-10 bg-gris-clair p-6 lg:sticky lg:top-24 lg:mt-6">
          <h2 className="label text-gris">Récapitulatif</h2>
          <div className="mt-3">
            <Totaux subtotal={subtotal} deliveryFee={null} />
          </div>

          <button
            type="button"
            onClick={() => navigate('/commande')}
            className="dc-focus dc-press label mt-6 w-full rounded-full bg-terre px-6 py-4 text-blanc hover:bg-terre/90"
          >
            Commander
          </button>

          <Link
            to="/"
            className="dc-focus dc-press mt-4 block text-center text-xs text-gris underline underline-offset-2 hover:text-noir"
          >
            Continuer mes achats
          </Link>
        </aside>
      </div>
    </section>
  )
}
