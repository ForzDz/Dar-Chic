import type { DeliveryType } from '../types'

/** Tarif fixe, toutes wilayas. À remplacer par une grille en base plus tard. */
export const DELIVERY_FEES: Record<DeliveryType, number> = {
  domicile: 600,
  stopdesk: 400,
}

export const DELIVERY_LABELS: Record<DeliveryType, string> = {
  domicile: 'À domicile',
  stopdesk: 'Stopdesk (point de retrait)',
}

export const DELIVERY_HINTS: Record<DeliveryType, string> = {
  domicile: 'Le livreur vous appelle et vient jusqu’à votre adresse.',
  stopdesk: 'Vous récupérez le colis au bureau du transporteur. Moins cher.',
}
