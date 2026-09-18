import type { Product } from '../types'

/**
 * Catalogue écrit en dur. Remplacera plus tard un `select * from products`.
 * Les prix sont en dinars algériens, en entiers (fourchette actuelle : 4 500 à 7 500 DA).
 * Noms et descriptions décrivent ce qu'on voit sur la photo, sans matière non confirmée.
 */
export const products: Product[] = [
  {
    id: 'sac-rabat-bordeaux',
    name: 'Sac à rabat bordeaux',
    description:
      'Rabat arrondi lisse, base matelassée, fermoir doré. Anneaux latéraux pour ajouter une bandoulière.',
    price: 6900,
    image_url: '/produits/produit-1.webp',
    stock: 7,
  },
  {
    id: 'sac-a-main-noir-foulard',
    name: 'Sac à main noir à foulard',
    description:
      'Forme trapèze structurée, fermoir doré, foulard imprimé noué à l’anse.',
    price: 7200,
    image_url: '/produits/produit-2.webp',
    stock: 12,
  },
  {
    id: 'mini-sac-bleu-marine',
    name: 'Mini sac bleu marine',
    description:
      'Petit format tenu à la main, fermoir doré, foulard imprimé noué aux deux attaches de l’anse.',
    price: 6500,
    image_url: '/produits/produit-3.webp',
    stock: 3,
  },
  {
    id: 'sac-epaule-blanc-tresse',
    name: 'Sac porté épaule blanc',
    description:
      'Rabat à motif tressé, bride et fermoir dorés, anse courte à porter à l’épaule.',
    price: 4900,
    image_url: '/produits/produit-4.webp',
    stock: 5,
  },
  {
    id: 'sac-demi-lune-creme',
    name: 'Sac demi-lune crème',
    description:
      'Forme demi-lune souple, fermeture zippée, anse fine à porter à la main ou à l’épaule.',
    price: 5800,
    image_url: '/produits/produit-5.webp',
    stock: 2,
  },
  {
    id: 'sac-bandouliere-noir-tresse',
    name: 'Sac bandoulière noir',
    description:
      'Rabat à motif tressé, bride et fermoir dorés, longue bandoulière pour le porter en travers.',
    price: 4500,
    image_url: '/produits/produit-6.webp',
    stock: 6,
  },
  {
    id: 'sac-a-main-rouge-foulard',
    name: 'Sac à main rouge à foulard',
    description:
      'Rouge vif, fermoir doré, foulard noué à l’anse et bijou de sac en forme de cheval.',
    price: 7500,
    image_url: '/produits/produit-7.webp',
    stock: 9,
  },
  {
    id: 'sac-rabat-bleu-marine',
    name: 'Sac à rabat bleu marine',
    description:
      'Rabat arrondi lisse, base matelassée, fermoir doré. Format compact, se tient à la main.',
    price: 6400,
    image_url: '/produits/produit-8.webp',
    stock: 4,
  },
]
