import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'

/** Au-delà de ce défilement (px), la navbar se détache des bords et la barre d'annonce se replie. */
const SCROLL_THRESHOLD = 80
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

/**
 * `scrolled` : on a dépassé 80px.
 * `compact` : la navbar est en pilule — après 80px, ou en permanence si moins d'animations est demandé.
 */
function useNavState(): { scrolled: boolean; compact: boolean } {
  const [scrolled, setScrolled] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(REDUCED_MOTION).matches,
  )

  useEffect(() => {
    const query = window.matchMedia(REDUCED_MOTION)
    const onChange = () => setReducedMotion(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    // Un seul listener, au plus une lecture de scrollY par frame.
    let frame = 0
    const update = () => {
      frame = 0
      setScrolled(window.scrollY > SCROLL_THRESHOLD)
    }
    const onScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(update)
    }

    update() // page rechargée au milieu du défilement
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame !== 0) window.cancelAnimationFrame(frame)
    }
  }, [])

  return { scrolled, compact: reducedMotion || scrolled }
}

const transition = 'duration-nav ease-nav motion-reduce:transition-none'

export default function Header() {
  const { count } = useCart()
  const { scrolled, compact } = useNavState()
  const { pathname } = useLocation()
  // La navbar fait partie de la séquence d'entrée du hero : seulement si la visite commence sur l'accueil.
  const [playIntro] = useState(() => pathname === '/')

  // Pulse du compteur à chaque ajout. Changer la clé remonte la pastille, ce qui rejoue l'animation CSS.
  // Pas au chargement (panier relu depuis localStorage), ni quand on retire un article.
  const previousCount = useRef(count)
  const [pulseKey, setPulseKey] = useState(0)
  useEffect(() => {
    if (count > previousCount.current) setPulseKey((key) => key + 1)
    previousCount.current = count
  }, [count])

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-30 flex flex-col items-center ${playIntro ? 'intro-nav' : ''}`}
      >
        {/* Barre d'annonce : se replie avec le scroll, en même temps que la navbar devient pilule. */}
        <div
          className={[
            'flex w-full items-center justify-center overflow-hidden bg-noir px-4 text-center text-blanc',
            'transition-[height]',
            transition,
            scrolled ? 'h-0' : 'h-8',
          ].join(' ')}
        >
          <p className="label truncate text-[10px] sm:text-[11px]">
            Livraison 58 wilayas · Paiement à la livraison
          </p>
        </div>

        <div
          className={[
            'border',
            'transition-[width,height,margin,background-color,border-color,border-radius,backdrop-filter]',
            transition,
            compact
              ? 'mt-3 h-[60px] w-[90%] rounded-[28px] border-filet bg-blanc/80 backdrop-blur-md'
              : 'mt-0 h-[72px] w-full rounded-none border-transparent bg-blanc/0 backdrop-blur-0',
          ].join(' ')}
        >
          <div className="mx-auto grid h-full max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:px-8">
            <Link
              to="/"
              className="dc-focus justify-self-start font-display text-lg font-black uppercase leading-none tracking-[-0.04em] sm:text-xl"
            >
              Dar Chic
            </Link>

            <nav aria-label="Navigation principale">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  [
                    'dc-focus dc-press label inline-block rounded-full px-3 py-2',
                    isActive ? 'text-noir' : 'text-gris hover:text-noir',
                  ].join(' ')
                }
              >
                Boutique
              </NavLink>
            </nav>

            <NavLink
              to="/panier"
              className={({ isActive }) =>
                [
                  'dc-focus label flex items-center gap-2 justify-self-end rounded-full border py-2 pl-4 pr-2 dc-press',
                  isActive
                    ? 'border-noir bg-noir text-blanc'
                    : 'border-noir/20 text-noir hover:border-noir',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  Panier
                  <span
                    key={pulseKey}
                    className={[
                      'inline-flex min-w-[1.5rem] justify-center rounded-full px-1.5 py-1 font-mono text-[11px] font-bold normal-case leading-none tracking-normal',
                      pulseKey > 0 ? 'pulse-compteur' : '',
                      isActive
                        ? 'bg-blanc text-noir'
                        : count > 0
                          ? 'bg-noir text-blanc'
                          : 'bg-filet text-gris',
                    ].join(' ')}
                  >
                    {count}
                  </span>
                </>
              )}
            </NavLink>
          </div>
        </div>
      </header>

      {/* Le header est fixe : cet espace réserve sa hauteur (barre d'annonce 32px + navbar 72px). */}
      <div aria-hidden="true" className="h-[104px]" />
    </>
  )
}
