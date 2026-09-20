import { useEffect, useState } from 'react'
import BandeConfiance from '../components/BandeConfiance'
import ProductCard from '../components/ProductCard'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { Product } from '../types'

/**
 * La séquence d'entrée ne se joue qu'au premier affichage de l'accueil.
 * Revenir depuis le panier ne la relance pas ; recharger la page, si.
 */
let heroIntroPlayed = false

type EtatCatalogue =
  | { statut: 'chargement' }
  | { statut: 'ok'; produits: Product[] }
  | { statut: 'erreur'; message: string; detail?: string }

/**
 * Le catalogue vient de la table `products` de Supabase.
 * Toute anomalie (requête en échec, table vide, configuration absente) est affichée
 * à l'écran, jamais avalée en silence, et la réponse brute part dans la console.
 */
function useCatalogue(): EtatCatalogue {
  const [etat, setEtat] = useState<EtatCatalogue>({ statut: 'chargement' })

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setEtat({
        statut: 'erreur',
        message: 'Configuration Supabase absente.',
        detail: 'VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY doivent être définies dans .env, puis il faut relancer le serveur de dev.',
      })
      return
    }

    let annule = false

    void (async () => {
      const reponse = await supabase
        .from('products')
        .select('id, name, description, price, image_url, stock')
        .order('created_at', { ascending: true })

      // Réponse complète dans la console, comme demandé : data, error, status, count.
      console.log('Supabase products →', reponse)

      if (annule) return

      const { data, error, status } = reponse

      if (error) {
        setEtat({
          statut: 'erreur',
          message: 'La requête vers Supabase a échoué.',
          detail: `[${status}${error.code ? ' · ' + error.code : ''}] ${error.message}${error.hint ? ' — ' + error.hint : ''}`,
        })
        return
      }

      if (!data || data.length === 0) {
        setEtat({
          statut: 'erreur',
          message: 'La table products ne renvoie aucun produit.',
          detail: `Requête réussie (statut ${status}), mais 0 ligne reçue. Table vide, ou lecture publique bloquée par les politiques RLS.`,
        })
        return
      }

      // La base autorise description, image_url et stock à null : on normalise pour l'affichage.
      setEtat({
        statut: 'ok',
        produits: data.map((ligne) => ({
          id: String(ligne.id),
          name: ligne.name,
          description: ligne.description ?? '',
          price: Number(ligne.price),
          image_url: ligne.image_url ?? '',
          stock: Number(ligne.stock ?? 0),
        })),
      })
    })()

    return () => {
      annule = true
    }
  }, [])

  return etat
}

export default function Accueil() {
  const [playIntro] = useState(() => !heroIntroPlayed)
  useEffect(() => {
    heroIntroPlayed = true
  }, [])

  const catalogue = useCatalogue()

  return (
    <>
      {/* ——— Hero : le nom en fond, le sac au centre par-dessus. Le sujet, c'est la photo. ——— */}
      <section
        className={`hero-ecran relative isolate flex flex-col overflow-hidden bg-blanc ${playIntro ? 'hero-intro' : ''}`}
      >
        <h1 className="sr-only">Dar Chic, sacs à main pour femmes à Oran</h1>

        {/* Nom géant, décoratif : une ligne dès 1024px, deux en dessous (mobile et tablette) pour remplir la hauteur. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 top-[104px] -z-10 flex select-none items-center justify-center"
        >
          <p className="intro-nom text-center font-display font-black uppercase leading-[0.78] tracking-[-0.06em] text-gris-clair">
            <span className="block text-[29vw] lg:inline lg:text-[15.5vw]">Dar</span>
            <span className="hidden lg:inline"> </span>
            <span className="block text-[29vw] lg:inline lg:text-[15.5vw]">Chic</span>
          </p>
        </div>

        {/*
          Photo détourée, centrée, qui déborde sur le nom. Élément principal de l'écran : chargée en priorité.
          Calée en bas et plafonnée en hauteur : au-delà de ces tailles
          elle masque le milieu de « DAR CHIC » (mesuré lettre par lettre en 360×640, 375×812, 768×1024, 1366×768, 1440×900).
        */}
        <div className="pointer-events-none absolute inset-x-0 bottom-24 top-[128px] flex items-end justify-center sm:bottom-20">
          {/* WebP détouré, recadré au contenu : 309×311, 30 Ko. Source : public/hero/sac.png. */}
          <img
            src="/hero/sac.webp"
            alt="Sac à main noir avec un foulard noué à l’anse"
            width={309}
            height={311}
            // React 18 ne connaît pas la propriété fetchPriority : on passe l'attribut HTML tel quel.
            {...{ fetchpriority: "high" }}
            decoding="async"
            className="intro-sac h-auto max-h-[40svh] w-auto max-w-[62%] object-contain lg:h-full lg:max-h-[min(52vh,560px)] lg:max-w-[55%]"
          />
        </div>

        <div className="relative mt-auto flex items-end justify-between gap-4 px-4 pb-6 sm:px-8 sm:pb-8">
          <a
            href="#catalogue"
            className="intro-cta dc-focus dc-press label inline-block rounded-full bg-noir px-6 py-3.5 text-blanc hover:bg-noir/85"
          >
            Voir la collection
          </a>
          <p className="intro-label label pb-3.5 text-gris">Collection 2026</p>
        </div>
      </section>

      <BandeConfiance />

      {/* ——— Catalogue : grille éditoriale, 2 colonnes sur mobile, 4 sur desktop ——— */}
      <section id="catalogue" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-14 sm:px-8 sm:py-20">
        <div className="mb-8 flex items-end justify-between gap-4 sm:mb-12">
          <h2 className="font-display text-3xl font-black uppercase leading-none tracking-[-0.05em] sm:text-6xl">
            La collection
          </h2>
          <p className="label text-gris">
            {catalogue.statut === 'ok' ? (
              <>
                <span className="font-mono">{catalogue.produits.length}</span> pièces
              </>
            ) : catalogue.statut === 'chargement' ? (
              'Chargement…'
            ) : (
              'Indisponible'
            )}
          </p>
        </div>

        {catalogue.statut === 'chargement' ? (
          <p aria-live="polite" className="text-sm text-gris">
            Chargement de la collection…
          </p>
        ) : catalogue.statut === 'erreur' ? (
          <div role="alert" className="max-w-[70ch] border-2 border-noir p-5">
            <p className="label">Catalogue indisponible</p>
            <p className="mt-3 text-sm font-semibold leading-relaxed">{catalogue.message}</p>
            {catalogue.detail ? (
              <p className="mt-2 text-sm leading-relaxed text-gris">{catalogue.detail}</p>
            ) : null}
            <p className="mt-3 text-xs leading-relaxed text-gris">
              La réponse complète de Supabase est dans la console du navigateur.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4 lg:gap-y-14">
            {catalogue.produits.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
