/**
 * Les noms de champs sont en anglais et calqués sur le futur schéma SQL
 * (voir database-schema.sql). Ne pas franciser : le jour où `products`
 * viendra de la base, le front ne bouge pas d’une ligne.
 */
export type Product = {
  id: string
  name: string
  description: string
  price: number // en DA, entier
  image_url: string
  stock: number
}

/** On garde le produit entier dans le panier, pas juste son id. */
export type CartItem = {
  product: Product
  quantity: number
}

export type DeliveryType = 'domicile' | 'stopdesk'

export type OrderDraft = {
  reference: string
  full_name: string
  phone: string
  wilaya: string
  commune: string
  address: string
  delivery_type: DeliveryType
  items: Array<{
    product_id: string
    name: string
    unit_price: number
    quantity: number
    line_total: number
  }>
  subtotal: number
  delivery_fee: number
  total: number
  created_at: string
}
