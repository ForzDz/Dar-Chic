import { Fragment, useCallback, useEffect, useState } from 'react'
import { formatDA, formatPhone } from '../../lib/format'
import { supabase } from '../../lib/supabase'

/** Statuts du suivi. `nouvelle` est la valeur par défaut de la base. */
const STATUTS = ['nouvelle', 'confirmée', 'expédiée', 'livrée', 'annulée'] as const
type Statut = (typeof STATUTS)[number]

type LigneCommande = {
  id: string
  quantity: number
  unit_price: number
  products: { name: string } | null
}

type Commande = {
  id: string
  created_at: string
  customer_name: string
  phone: string
  wilaya: string
  commune: string
  address: string
  delivery_type: string
  delivery_fee: number
  subtotal: number
  total: number
  status: string
  order_items: LigneCommande[]
}

type Etat =
  | { statut: 'chargement' }
  | { statut: 'ok'; commandes: Commande[] }
  | { statut: 'erreur'; message: string; detail?: string }

const dateFr = new Intl.DateTimeFormat('fr-DZ', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export default function AdminCommandes() {
  const [etat, setEtat] = useState<Etat>({ statut: 'chargement' })
  const [depliee, setDepliee] = useState<string | null>(null)
  const [majEnCours, setMajEnCours] = useState<string | null>(null)
  const [erreurMaj, setErreurMaj] = useState<string | null>(null)

  const charger = useCallback(async () => {
    const reponse = await supabase
      .from('orders')
      .select(
        'id, created_at, customer_name, phone, wilaya, commune, address, delivery_type, delivery_fee, subtotal, total, status, order_items ( id, quantity, unit_price, products ( name ) )',
      )
      .order('created_at', { ascending: false })

    console.log('Supabase orders select →', reponse)

    const { data, error, status } = reponse

    if (error) {
      setEtat({
        statut: 'erreur',
        message: 'Impossible de lire les commandes.',
        detail: `[${status}${error.code ? ' · ' + error.code : ''}] ${error.message}${error.hint ? ' — ' + error.hint : ''}`,
      })
      return
    }

    if (!data || data.length === 0) {
      setEtat({
        statut: 'erreur',
        message: 'Aucune commande à afficher.',
        detail: `Requête réussie (statut ${status}), mais 0 ligne reçue. Soit aucune commande n'a encore été passée, soit la lecture de la table orders est bloquée faute de politique RLS pour le compte connecté.`,
      })
      return
    }

    setEtat({ statut: 'ok', commandes: data as unknown as Commande[] })
  }, [])

  useEffect(() => {
    void charger()
  }, [charger])

  async function changerStatut(commande: Commande, statut: Statut) {
    setMajEnCours(commande.id)
    setErreurMaj(null)

    const reponse = await supabase.from('orders').update({ status: statut }).eq('id', commande.id)
    console.log('Supabase orders update →', reponse)
    setMajEnCours(null)

    if (reponse.error) {
      setErreurMaj(
        `Statut non modifié — [${reponse.status}${reponse.error.code ? ' · ' + reponse.error.code : ''}] ${reponse.error.message}`,
      )
      return
    }

    setEtat((actuel) =>
      actuel.statut === 'ok'
        ? {
            statut: 'ok',
            commandes: actuel.commandes.map((c) =>
              c.id === commande.id ? { ...c, status: statut } : c,
            ),
          }
        : actuel,
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-8 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-noir pb-4">
        <h1 className="font-display text-3xl font-black uppercase leading-none tracking-[-0.05em] sm:text-5xl">
          Commandes
        </h1>
        <p className="label text-gris">
          {etat.statut === 'ok' ? (
            <>
              <span className="font-mono">{etat.commandes.length}</span> commandes
            </>
          ) : etat.statut === 'chargement' ? (
            'Chargement…'
          ) : (
            'Indisponible'
          )}
        </p>
      </div>

      {erreurMaj ? (
        <div role="alert" className="mt-6 border-2 border-noir p-4">
          <p className="label">Mise à jour refusée</p>
          <p className="mt-2 text-sm font-semibold leading-relaxed">{erreurMaj}</p>
          <p className="mt-2 text-xs leading-relaxed text-gris">
            Il faut une politique RLS UPDATE sur `orders` pour le compte connecté.
          </p>
        </div>
      ) : null}

      {etat.statut === 'chargement' ? (
        <p className="mt-8 text-sm text-gris">Chargement des commandes…</p>
      ) : etat.statut === 'erreur' ? (
        <div role="alert" className="mt-8 max-w-[70ch] border-2 border-noir p-5">
          <p className="label">Commandes indisponibles</p>
          <p className="mt-3 text-sm font-semibold leading-relaxed">{etat.message}</p>
          {etat.detail ? (
            <p className="mt-2 text-sm leading-relaxed text-gris">{etat.detail}</p>
          ) : null}
          <p className="mt-3 text-xs leading-relaxed text-gris">
            La réponse complète est dans la console du navigateur.
          </p>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[56rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-filet text-left">
                {['Date', 'Cliente', 'Téléphone', 'Wilaya', 'Commune', 'Total', 'Statut', ''].map(
                  (entete) => (
                    <th key={entete} scope="col" className="label px-3 py-3 text-gris">
                      {entete}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {etat.commandes.map((commande) => {
                const ouverte = depliee === commande.id
                return (
                  <Fragment key={commande.id}>
                    <tr className="border-b border-filet align-top">
                      <td className="px-3 py-4 font-mono text-xs text-gris">
                        {dateFr.format(new Date(commande.created_at))}
                      </td>
                      <td className="px-3 py-4 font-semibold">{commande.customer_name}</td>
                      <td className="px-3 py-4 font-mono text-xs">
                        {formatPhone(commande.phone)}
                      </td>
                      <td className="px-3 py-4">{commande.wilaya}</td>
                      <td className="px-3 py-4">{commande.commune}</td>
                      <td className="px-3 py-4 font-mono font-bold">{formatDA(commande.total)}</td>
                      <td className="px-3 py-4">
                        <select
                          aria-label={`Statut de la commande de ${commande.customer_name}`}
                          value={STATUTS.includes(commande.status as Statut) ? commande.status : ''}
                          disabled={majEnCours === commande.id}
                          onChange={(e) => changerStatut(commande, e.target.value as Statut)}
                          className="dc-focus rounded-none border border-filet bg-transparent px-2 py-1.5 text-xs hover:border-gris disabled:cursor-not-allowed disabled:text-gris"
                        >
                          {!STATUTS.includes(commande.status as Statut) ? (
                            <option value="">{commande.status || '—'}</option>
                          ) : null}
                          {STATUTS.map((statut) => (
                            <option key={statut} value={statut}>
                              {statut}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setDepliee(ouverte ? null : commande.id)}
                          aria-expanded={ouverte}
                          className="dc-focus dc-press label rounded-full border border-noir/20 px-3 py-1.5 hover:border-noir"
                        >
                          {ouverte ? 'Replier' : 'Détail'}
                        </button>
                      </td>
                    </tr>

                    {ouverte ? (
                      <tr className="border-b border-filet bg-gris-clair">
                        <td colSpan={8} className="px-3 py-5">
                          <div className="grid gap-6 sm:grid-cols-[1fr_20rem]">
                            <div>
                              <p className="label text-gris">Articles</p>
                              <ul className="mt-3 divide-y divide-filet border-y border-filet">
                                {commande.order_items.length === 0 ? (
                                  <li className="py-2.5 text-sm text-gris">
                                    Aucune ligne lisible pour cette commande.
                                  </li>
                                ) : (
                                  commande.order_items.map((ligne) => (
                                    <li
                                      key={ligne.id}
                                      className="flex justify-between gap-4 py-2.5 text-sm"
                                    >
                                      <span>
                                        {ligne.products?.name ?? 'Produit supprimé'}
                                        <span className="ml-2 font-mono text-xs text-gris">
                                          ×{ligne.quantity}
                                        </span>
                                      </span>
                                      <span className="shrink-0 font-mono">
                                        {formatDA(ligne.unit_price * ligne.quantity)}
                                      </span>
                                    </li>
                                  ))
                                )}
                              </ul>
                            </div>

                            <div className="text-sm">
                              <p className="label text-gris">Livraison</p>
                              <p className="mt-3 leading-relaxed">
                                {commande.address}
                                <br />
                                {commande.commune}, {commande.wilaya}
                              </p>
                              <p className="mt-3 text-gris">
                                {commande.delivery_type} ·{' '}
                                <span className="font-mono">{formatDA(commande.delivery_fee)}</span>
                              </p>
                              <p className="mt-3 font-mono">
                                Sous-total {formatDA(commande.subtotal)}
                              </p>
                              <p className="font-mono font-bold">Total {formatDA(commande.total)}</p>
                              <p className="mt-3 font-mono text-[11px] text-gris">{commande.id}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
