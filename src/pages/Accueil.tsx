import { useEffect, useState } from 'react'
import BandeConfiance from '../components/BandeConfiance'
import ProductCard from '../components/ProductCard'
import { products } from '../data/products'

/**
 * La séquence d'entrée ne se joue qu'au premier affichage de l'accueil.
 * Revenir depuis le panier ne la relance pas ; recharger la page, si.
 */
let heroIntroPlayed = false

export default function Accueil() {
  const [playIntro] = useState(() => !heroIntroPlayed)
  useEffect(() => {
    heroIntroPlayed = true
  }, [])

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
            fetchPriority="high"
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
            <span className="font-mono">{products.length}</span> pièces
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4 lg:gap-y-14">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </>
  )
}
