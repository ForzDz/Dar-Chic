import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { products } from '../data/products'
import type { CartItem, Product } from '../types'

const STORAGE_KEY = 'dar-chic:panier:v1'

type CartContextValue = {
  items: CartItem[]
  /** Nombre total d’articles, toutes lignes confondues (pour le badge du header). */
  count: number
  /** Somme des lignes, hors frais de livraison. */
  subtotal: number
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  setQuantity: (productId: string, quantity: number) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

/**
 * Le panier vit ici, sans librairie externe. Il est relu depuis localStorage
 * au premier rendu : il survit donc au changement de page comme au rafraîchissement.
 */
function readStoredCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    // Garde-fou : on ignore toute ligne qui n’a pas la forme attendue.
    const lines = parsed.filter(
      (line): line is CartItem =>
        typeof line === 'object' &&
        line !== null &&
        typeof (line as CartItem).quantity === 'number' &&
        (line as CartItem).quantity > 0 &&
        typeof (line as CartItem).product?.id === 'string',
    )
    // Le produit stocké peut être périmé (nom, prix, photo, stock changés). Quand il figure encore
    // dans le catalogue local, on repart de celui-ci. Sinon on garde la ligne telle quelle : depuis
    // que l’accueil lit la table `products` de Supabase, un produit absent d’ici est normal.
    return lines.map((line) => {
      const product = products.find((p) => p.id === line.product.id)
      if (!product) return line
      return { product, quantity: Math.min(line.quantity, product.stock) }
    })
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readStoredCart)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Navigation privée, quota plein : le panier reste en mémoire, on n’explose pas.
    }
  }, [items])

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((line) => line.product.id === product.id)
      if (!existing) {
        return [...current, { product, quantity: Math.min(quantity, product.stock) }]
      }
      return current.map((line) =>
        line.product.id === product.id
          ? {
              // On rafraîchit le produit : si le prix a changé, la ligne suit.
              product,
              quantity: Math.min(line.quantity + quantity, product.stock),
            }
          : line,
      )
    })
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems((current) => current.filter((line) => line.product.id !== productId))
  }, [])

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setItems((current) =>
      current.flatMap((line) => {
        if (line.product.id !== productId) return [line]
        const next = Math.min(Math.max(quantity, 0), line.product.stock)
        return next <= 0 ? [] : [{ ...line, quantity: next }]
      }),
    )
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, line) => sum + line.quantity, 0)
    const subtotal = items.reduce((sum, line) => sum + line.product.price * line.quantity, 0)
    return { items, count, subtotal, addItem, removeItem, setQuantity, clear }
  }, [items, addItem, removeItem, setQuantity, clear])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart doit être utilisé à l’intérieur de <CartProvider>')
  }
  return context
}
