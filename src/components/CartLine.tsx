import { useCart } from '../context/CartContext'
import { formatDA } from '../lib/format'
import type { CartItem } from '../types'

export default function CartLine({ line }: { line: CartItem }) {
  const { setQuantity, removeItem } = useCart()
  const { product, quantity } = line
  const atMax = quantity >= product.stock

  return (
    <li className="flex gap-4 border-b border-filet py-5">
      <img
        src={product.image_url}
        alt={product.name}
        className="aspect-[4/5] w-20 shrink-0 bg-gris-clair object-cover sm:w-24"
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold leading-snug">{product.name}</h3>
            <p className="mt-0.5 font-mono text-xs text-gris">{formatDA(product.price)} l’unité</p>
          </div>
          <button
            type="button"
            onClick={() => removeItem(product.id)}
            aria-label={`Retirer ${product.name} du panier`}
            className="dc-focus dc-press shrink-0 px-1 py-1 text-xs text-gris underline underline-offset-2 hover:text-noir"
          >
            Retirer
          </button>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <div className="flex items-center border border-filet">
            <button
              type="button"
              onClick={() => setQuantity(product.id, quantity - 1)}
              aria-label={`Diminuer la quantité de ${product.name}`}
              className="dc-focus dc-press px-3 py-1.5 text-base leading-none hover:bg-gris-clair"
            >
              −
            </button>
            <span
              aria-live="polite"
              className="min-w-[2.5rem] border-x border-filet px-2 py-1.5 text-center font-mono text-sm font-bold"
            >
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(product.id, quantity + 1)}
              disabled={atMax}
              aria-label={`Augmenter la quantité de ${product.name}`}
              className="dc-focus dc-press px-3 py-1.5 text-base leading-none hover:bg-gris-clair disabled:cursor-not-allowed disabled:text-gris/40 disabled:hover:bg-transparent"
            >
              +
            </button>
          </div>

          <span className="font-mono text-base font-bold">{formatDA(product.price * quantity)}</span>
        </div>

        {atMax ? (
          <p className="mt-1.5 text-[11px] text-gris">
            Stock disponible : <span className="font-mono">{product.stock}</span>
          </p>
        ) : null}
      </div>
    </li>
  )
}
