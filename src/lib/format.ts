/**
 * Un seul endroit pour écrire un montant. Espace insécable fine avant « DA »
 * et séparateur de milliers en espace insécable, comme sur un bon de livraison.
 */
export function formatDA(amount: number): string {
  return `${amount.toLocaleString('fr-DZ').replace(/ |,/g, ' ')} DA`
}

/** Référence de commande : #ORN-0416 (ORN = Oran). */
export function generateReference(): string {
  const n = Math.floor(1000 + Math.random() * 9000)
  return `#ORN-${n}`
}

/** Affichage lisible d’un mobile algérien : 0555 12 34 56. */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length !== 10) return phone
  return `${digits.slice(0, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 8)} ${digits.slice(8)}`
}
