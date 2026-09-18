import type { ReactNode } from 'react'

/** Pictogrammes au trait fin, dessinés à la main : pas de librairie d'icônes, pas d'emoji. */
function Picto({ children }: { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      className="h-8 w-8 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  )
}

const engagements: Array<{ title: string; detail: ReactNode; picto: ReactNode }> = [
  {
    title: 'Livraison 58 wilayas',
    detail: (
      <>
        <span className="font-mono">600&nbsp;DA</span> à domicile,{' '}
        <span className="font-mono">400&nbsp;DA</span> en stopdesk
      </>
    ),
    picto: (
      <>
        <path d="M3 9h16v13H3z" />
        <path d="M19 13h5l4 5v4h-9" />
        <circle cx="9" cy="23.5" r="2.5" />
        <circle cx="23" cy="23.5" r="2.5" />
      </>
    ),
  },
  {
    title: 'Paiement à la livraison',
    detail: 'En espèces, le colis en main',
    picto: (
      <>
        <rect x="3" y="9" width="26" height="15" />
        <circle cx="16" cy="16.5" r="3.5" />
        <path d="M7 13v7M25 13v7" />
      </>
    ),
  },
  {
    title: 'Échange sous 48h',
    detail: 'À compter de la réception',
    picto: (
      <>
        <path d="M5 11h20l-5-5" />
        <path d="M27 21H7l5 5" />
      </>
    ),
  },
  {
    title: 'Cousu en petite série',
    detail: 'À Oran',
    picto: (
      <>
        <path d="M6 26 25 7" />
        <ellipse cx="25.5" cy="6.5" rx="1.5" ry="3" transform="rotate(45 25.5 6.5)" />
        <path d="M6 26c4-1 5-6 9-6s3 6 8 6 4-4 4-4" />
      </>
    ),
  },
]

export default function BandeConfiance() {
  return (
    <section aria-label="Nos engagements" className="bg-noir text-blanc">
      <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-8 px-4 py-10 sm:px-8 lg:grid-cols-4 lg:gap-x-8 lg:py-12">
        {engagements.map(({ title, detail, picto }) => (
          <li key={title} className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
            <Picto>{picto}</Picto>
            <div>
              <p className="text-sm font-semibold leading-snug">{title}</p>
              <p className="mt-1 text-xs leading-snug text-blanc/60">{detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
