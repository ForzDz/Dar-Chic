import { formatDA } from '../lib/format'

type TotauxProps = {
  subtotal: number
  /** null = le mode de livraison n’est pas encore choisi. */
  deliveryFee: number | null
  deliveryLabel?: string
}

/**
 * Sous-total, frais, total — trois lignes nettement séparées.
 * La cliente doit voir exactement ce qu’elle tendra au livreur.
 */
export default function Totaux({ subtotal, deliveryFee, deliveryLabel }: TotauxProps) {
  const total = subtotal + (deliveryFee ?? 0)

  return (
    <div className="text-sm">
      <div className="flex items-baseline justify-between py-2.5">
        <span className="text-gris">Sous-total</span>
        <span className="font-mono font-bold">{formatDA(subtotal)}</span>
      </div>

      <div className="flex items-baseline justify-between gap-3 border-t border-filet py-2.5">
        <span className="text-gris">
          Livraison
          {deliveryLabel ? <span className="ml-1">· {deliveryLabel}</span> : null}
        </span>
        {deliveryFee === null ? (
          <span className="text-gris">à choisir</span>
        ) : (
          <span className="shrink-0 font-mono font-bold">{formatDA(deliveryFee)}</span>
        )}
      </div>

      <div className="mt-1 flex items-baseline justify-between border-t-2 border-noir pt-3">
        <span className="label">
          {deliveryFee === null ? 'Total hors livraison' : 'Total à payer'}
        </span>
        <span className="font-mono text-xl font-bold">{formatDA(total)}</span>
      </div>

      <p className="mt-2 text-[11px] leading-snug text-gris">
        {deliveryFee === null ? (
          <>
            Les frais de livraison s’ajoutent à l’étape suivante :{' '}
            <span className="font-mono">600&nbsp;DA</span> à domicile,{' '}
            <span className="font-mono">400&nbsp;DA</span> en stopdesk.
          </>
        ) : (
          'Payable en espèces au livreur, à la réception du colis.'
        )}
      </p>
    </div>
  )
}
