import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { formatDA } from '../lib/format'
import type { Product } from '../types'

/**
 * Carte éditoriale : image 4:5 sans bordure ni ombre, nom et prix dessous.
 * Souris : l'image s'assombrit et « Ajouter » apparaît au survol.
 * Tactile (hover: none) : pas de survol possible, le bouton reste visible en permanence.
 */
export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [justAdded, setJustAdded] = useState(false)
  const isOutOfStock = product.stock <= 0

  function handleAdd() {
    if (isOutOfStock) return
    addItem(product)
    setJustAdded(true)
    window.setTimeout(() => setJustAdded(false), 1400)
  }

  return (
    <article className="group">
      <div className="relative aspect-[4/5] overflow-hidden bg-gris-clair">
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-noir/0 transition-colors duration-300 group-focus-within:bg-noir/15 group-hover:bg-noir/15 [@media(hover:none)]:hidden"
        />

        {isOutOfStock ? (
          <span className="label absolute left-2 top-2 bg-noir px-2 py-1 text-[10px] text-blanc">
            Épuisé
          </span>
        ) : product.stock <= 3 ? (
          <span className="label absolute left-2 top-2 bg-terre px-2 py-1 text-[10px] text-blanc">
            Plus que <span className="font-mono">{product.stock}</span>
          </span>
        ) : null}

        <button
          type="button"
          onClick={handleAdd}
          disabled={isOutOfStock}
          aria-label={`Ajouter ${product.name} au panier`}
          className={[
            'dc-focus label absolute inset-x-2 bottom-2 rounded-full py-2.5 text-[10px] sm:inset-x-3 sm:bottom-3 sm:py-3 sm:text-[11px]',
            'translate-y-2 opacity-0 transition duration-300 ease-nav',
            'group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100',
            // Retrait au clic : le scale se compose avec le translate du survol, sans le modifier.
            'enabled:active:scale-[0.98] motion-reduce:active:scale-100',
            '[@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100',
            isOutOfStock
              ? 'cursor-not-allowed bg-filet text-gris'
              : justAdded
                ? 'bg-noir text-blanc'
                : 'bg-terre text-blanc hover:bg-terre/90',
          ].join(' ')}
        >
          {isOutOfStock ? 'Indisponible' : justAdded ? 'Ajouté' : 'Ajouter'}
        </button>
      </div>

      <h3 className="mt-3 text-[13px] leading-snug">{product.name}</h3>
      <p className="mt-0.5 font-mono text-sm">{formatDA(product.price)}</p>
    </article>
  )
}
