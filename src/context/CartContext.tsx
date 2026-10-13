import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { logDev, logErreur } from '../lib/log'
import { supabase } from '../lib/supabase'
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
    // Les lignes sont rendues telles quelles pour que le panier s'affiche tout de suite.
    // Elles sont ensuite resynchronisées sur Supabase (voir CartProvider).
    return lines
  } catch {
    return []
  }
}

/** Les id de `products` sont des uuid : une autre forme vient forcément d'un ancien panier. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readStoredCart)

  /**
   * Au démarrage, le panier relu dans localStorage porte le produit tel qu'il était
   * au moment de l'ajout. On le recale sur la table `products` : nom, prix, photo et
   * stock à jour, lignes retirées si le produit n'existe plus ou n'est plus en stock.
   * En cas d'échec réseau, on garde le panier tel quel plutôt que de le vider.
   */
  useEffect(() => {
    const identifiants = items.map((line) => line.product.id).filter((id) => UUID.test(id))
    const aDesLignesInconnues = items.some((line) => !UUID.test(line.product.id))

    if (identifiants.length === 0) {
      // Rien à vérifier : s'il reste d'anciennes lignes hors base, elles partent.
      if (aDesLignesInconnues) setItems([])
      return
    }

    let annule = false

    void (async () => {
      const reponse = await supabase
        .from('products')
        .select('id, name, description, price, image_url, stock')
        .in('id', identifiants)

      if (annule) return

      if (reponse.error) {
        logErreur('Supabase products (resynchronisation du panier) →', reponse.error)
        return
      }

      logDev('Panier resynchronisé →', { demandes: identifiants.length, reçus: reponse.data.length })

      const parId = new Map(
        reponse.data.map((ligne) => [
          String(ligne.id),
          {
            id: String(ligne.id),
            name: ligne.name,
            description: ligne.description ?? '',
            price: Number(ligne.price),
            image_url: ligne.image_url ?? '',
            stock: Number(ligne.stock ?? 0),
          } satisfies Product,
        ]),
      )

      setItems((actuels) =>
        actuels.flatMap((line) => {
          const product = parId.get(line.product.id)
          if (!product) return []
          const quantity = Math.min(line.quantity, product.stock)
          return quantity <= 0 ? [] : [{ product, quantity }]
        }),
      )
    })()

    return () => {
      annule = true
    }
    // Une seule fois au démarrage, sur le panier relu dans localStorage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
