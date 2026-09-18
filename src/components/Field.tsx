import type { ReactNode } from 'react'

type FieldProps = {
  id: string
  label: string
  hint?: string
  error?: string
  required?: boolean
  children: ReactNode
}

/** Un seul gabarit de champ pour tout le formulaire de commande. */
export default function Field({ id, label, hint, error, required, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="label text-gris">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      <div className="mt-2">{children}</div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-semibold text-noir">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-gris">{hint}</p>
      ) : null}
    </div>
  )
}

/** Classes partagées par les input / select / textarea du formulaire. Coins droits. */
export const fieldClass =
  'dc-focus w-full rounded-none bg-transparent text-sm text-noir placeholder:text-gris/70'

/**
 * Erreur : bordure noire de 2px, pas d'accent terre (réservé aux badges et aux boutons d'action).
 * Le padding compense l'épaisseur pour que le champ ne bouge pas d'un pixel.
 */
export function fieldBorder(hasError: boolean): string {
  return hasError
    ? 'border-2 border-noir px-[11px] py-[9px]'
    : 'border border-filet px-3 py-2.5 hover:border-gris'
}
