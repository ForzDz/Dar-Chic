import { useCallback, useEffect, useState, type FormEvent } from 'react'
import Field, { fieldBorder, fieldClass } from '../../components/Field'
import { formatDA } from '../../lib/format'
import { supabase } from '../../lib/supabase'
import type { Product } from '../../types'

type Etat =
  | { statut: 'chargement' }
  | { statut: 'ok'; produits: Product[] }
  | { statut: 'erreur'; message: string; detail?: string }

type Formulaire = {
  id: string | null
  name: string
  description: string
  price: string
  image_url: string
  stock: string
}

const FORMULAIRE_VIDE: Formulaire = {
  id: null,
  name: '',
  description: '',
  price: '',
  image_url: '',
  stock: '',
}

/** Les champs conservent les noms de colonnes de la base : name, description, price, image_url, stock. */
export default function AdminProduits() {
  const [etat, setEtat] = useState<Etat>({ statut: 'chargement' })
  const [formulaire, setFormulaire] = useState<Formulaire>(FORMULAIRE_VIDE)
  const [enregistrement, setEnregistrement] = useState(false)
  const [erreurEcriture, setErreurEcriture] = useState<string | null>(null)
  const [aSupprimer, setASupprimer] = useState<Product | null>(null)

  const charger = useCallback(async () => {
    const reponse = await supabase
      .from('products')
      .select('id, name, description, price, image_url, stock')
      .order('created_at', { ascending: true })

    console.log('Supabase products select →', reponse)

    const { data, error, status } = reponse

    if (error) {
      setEtat({
        statut: 'erreur',
        message: 'Impossible de lire le catalogue.',
        detail: `[${status}${error.code ? ' · ' + error.code : ''}] ${error.message}${error.hint ? ' — ' + error.hint : ''}`,
      })
      return
    }

    setEtat({
      statut: 'ok',
      produits: (data ?? []).map((ligne) => ({
        id: String(ligne.id),
        name: ligne.name,
        description: ligne.description ?? '',
        price: Number(ligne.price),
        image_url: ligne.image_url ?? '',
        stock: Number(ligne.stock ?? 0),
      })),
    })
  }, [])

  useEffect(() => {
    void charger()
  }, [charger])

  function editer(produit: Product) {
    setErreurEcriture(null)
    setFormulaire({
      id: produit.id,
      name: produit.name,
      description: produit.description,
      price: String(produit.price),
      image_url: produit.image_url,
      stock: String(produit.stock),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function signalerErreur(action: string, reponse: { status: number; error: { message: string; code?: string; hint?: string | null } | null }) {
    const erreur = reponse.error
    if (!erreur) return false
    setErreurEcriture(
      `${action} — [${reponse.status}${erreur.code ? ' · ' + erreur.code : ''}] ${erreur.message}${erreur.hint ? ' — ' + erreur.hint : ''}`,
    )
    return true
  }

  async function enregistrer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (enregistrement) return

    const prix = Number(formulaire.price)
    const stock = Number(formulaire.stock)

    if (!formulaire.name.trim()) {
      setErreurEcriture('Le nom est obligatoire.')
      return
    }
    if (!Number.isInteger(prix) || prix < 0) {
      setErreurEcriture('Le prix doit être un nombre entier de dinars, sans centimes.')
      return
    }
    if (!Number.isInteger(stock) || stock < 0) {
      setErreurEcriture('Le stock doit être un nombre entier positif ou nul.')
      return
    }

    setErreurEcriture(null)
    setEnregistrement(true)

    const valeurs = {
      name: formulaire.name.trim(),
      description: formulaire.description.trim() || null,
      price: prix,
      image_url: formulaire.image_url.trim() || null,
      stock,
    }

    const reponse = formulaire.id
      ? await supabase.from('products').update(valeurs).eq('id', formulaire.id)
      : await supabase.from('products').insert(valeurs)

    console.log(formulaire.id ? 'Supabase products update →' : 'Supabase products insert →', reponse)
    setEnregistrement(false)

    if (signalerErreur(formulaire.id ? 'Modification refusée' : 'Ajout refusé', reponse)) return

    setFormulaire(FORMULAIRE_VIDE)
    await charger()
  }

  async function supprimer(produit: Product) {
    setErreurEcriture(null)
    const reponse = await supabase.from('products').delete().eq('id', produit.id)
    console.log('Supabase products delete →', reponse)
    setASupprimer(null)

    if (signalerErreur('Suppression refusée', reponse)) return
    if (formulaire.id === produit.id) setFormulaire(FORMULAIRE_VIDE)
    await charger()
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-8 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-noir pb-4">
        <h1 className="font-display text-3xl font-black uppercase leading-none tracking-[-0.05em] sm:text-5xl">
          Produits
        </h1>
        <p className="label text-gris">
          {etat.statut === 'ok' ? (
            <>
              <span className="font-mono">{etat.produits.length}</span> pièces
            </>
          ) : etat.statut === 'chargement' ? (
            'Chargement…'
          ) : (
            'Indisponible'
          )}
        </p>
      </div>

      <div className="mt-8 gap-12 lg:grid lg:grid-cols-[1fr_24rem] lg:items-start">
        {/* ——— Liste ——— */}
        <div>
          {etat.statut === 'chargement' ? (
            <p className="text-sm text-gris">Chargement du catalogue…</p>
          ) : etat.statut === 'erreur' ? (
            <div role="alert" className="max-w-[70ch] border-2 border-noir p-5">
              <p className="label">Catalogue indisponible</p>
              <p className="mt-3 text-sm font-semibold leading-relaxed">{etat.message}</p>
              {etat.detail ? (
                <p className="mt-2 text-sm leading-relaxed text-gris">{etat.detail}</p>
              ) : null}
            </div>
          ) : etat.produits.length === 0 ? (
            <p className="text-sm text-gris">
              Aucun produit pour l’instant. Ajoutez-en un avec le formulaire.
            </p>
          ) : (
            <ul className="divide-y divide-filet border-y border-filet">
              {etat.produits.map((produit) => (
                <li key={produit.id} className="flex gap-4 py-4">
                  <img
                    src={produit.image_url || '/hero/sac.webp'}
                    alt=""
                    className="aspect-[4/5] w-16 shrink-0 bg-gris-clair object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-snug">{produit.name}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-snug text-gris">
                      {produit.description || 'Sans description'}
                    </p>
                    <p className="mt-1.5 font-mono text-sm">
                      {formatDA(produit.price)}
                      <span className="ml-3 text-xs text-gris">stock {produit.stock}</span>
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <button
                      type="button"
                      onClick={() => editer(produit)}
                      className="dc-focus dc-press label rounded-full border border-noir/20 px-3 py-1.5 hover:border-noir"
                    >
                      Modifier
                    </button>
                    {aSupprimer?.id === produit.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => supprimer(produit)}
                          className="dc-focus dc-press label rounded-full bg-noir px-3 py-1.5 text-blanc hover:bg-noir/85"
                        >
                          Confirmer
                        </button>
                        <button
                          type="button"
                          onClick={() => setASupprimer(null)}
                          className="dc-focus dc-press text-xs text-gris underline underline-offset-2 hover:text-noir"
                        >
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setASupprimer(produit)}
                        className="dc-focus dc-press text-xs text-gris underline underline-offset-2 hover:text-noir"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ——— Ajout / modification ——— */}
        <aside className="mt-10 bg-gris-clair p-6 lg:sticky lg:top-6 lg:mt-0">
          <h2 className="label text-gris">
            {formulaire.id ? 'Modifier le produit' : 'Ajouter un produit'}
          </h2>

          <form onSubmit={enregistrer} noValidate className="mt-4 space-y-5">
            <Field id="name" label="Nom" required>
              <input
                id="name"
                value={formulaire.name}
                onChange={(e) => setFormulaire({ ...formulaire, name: e.target.value })}
                className={`${fieldClass} ${fieldBorder(false)}`}
              />
            </Field>

            <Field id="description" label="Description">
              <textarea
                id="description"
                rows={3}
                value={formulaire.description}
                onChange={(e) => setFormulaire({ ...formulaire, description: e.target.value })}
                className={`${fieldClass} ${fieldBorder(false)} resize-y`}
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="price" label="Prix (DA)" required>
                <input
                  id="price"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  value={formulaire.price}
                  onChange={(e) => setFormulaire({ ...formulaire, price: e.target.value })}
                  className={`${fieldClass} ${fieldBorder(false)} font-mono`}
                />
              </Field>

              <Field id="stock" label="Stock" required>
                <input
                  id="stock"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  value={formulaire.stock}
                  onChange={(e) => setFormulaire({ ...formulaire, stock: e.target.value })}
                  className={`${fieldClass} ${fieldBorder(false)} font-mono`}
                />
              </Field>
            </div>

            <Field
              id="image_url"
              label="Image (URL)"
              hint="Chemin du site, par exemple /produits/produit-1.webp, ou adresse complète."
            >
              <input
                id="image_url"
                value={formulaire.image_url}
                onChange={(e) => setFormulaire({ ...formulaire, image_url: e.target.value })}
                className={`${fieldClass} ${fieldBorder(false)}`}
              />
            </Field>

            <button
              type="submit"
              disabled={enregistrement}
              className="dc-focus dc-press label w-full rounded-full bg-terre px-6 py-4 text-blanc hover:bg-terre/90 disabled:cursor-not-allowed disabled:bg-filet disabled:text-gris"
            >
              {enregistrement
                ? 'Enregistrement…'
                : formulaire.id
                  ? 'Enregistrer les modifications'
                  : 'Ajouter le produit'}
            </button>

            {formulaire.id ? (
              <button
                type="button"
                onClick={() => setFormulaire(FORMULAIRE_VIDE)}
                className="dc-focus dc-press block w-full text-center text-xs text-gris underline underline-offset-2 hover:text-noir"
              >
                Annuler la modification
              </button>
            ) : null}

            {erreurEcriture ? (
              <div role="alert" className="border-2 border-noir p-4">
                <p className="label">Opération refusée</p>
                <p className="mt-2 text-sm font-semibold leading-relaxed">{erreurEcriture}</p>
                <p className="mt-2 text-xs leading-relaxed text-gris">
                  La réponse complète est dans la console du navigateur.
                </p>
              </div>
            ) : null}
          </form>
        </aside>
      </div>
    </section>
  )
}
