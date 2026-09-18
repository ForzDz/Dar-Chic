import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import Field, { fieldBorder, fieldClass } from '../components/Field'
import Totaux from '../components/Totaux'
import { useCart } from '../context/CartContext'
import { DELIVERY_FEES, DELIVERY_HINTS, DELIVERY_LABELS } from '../data/livraison'
import { wilayas } from '../data/wilayas'
import { formatDA, formatPhone, generateReference } from '../lib/format'
import type { DeliveryType, OrderDraft } from '../types'

type FormState = {
  full_name: string
  phone: string
  wilaya: string
  commune: string
  address: string
  delivery_type: DeliveryType
}

type FormErrors = Partial<Record<keyof FormState, string>>

const EMPTY_FORM: FormState = {
  full_name: '',
  phone: '',
  wilaya: '',
  commune: '',
  address: '',
  delivery_type: 'domicile',
}

/** Mobile algérien : 10 chiffres, commence par 05, 06 ou 07. */
const PHONE_PATTERN = /^0[5-7]\d{8}$/

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {}

  if (form.full_name.trim().length < 3) {
    errors.full_name = 'Indiquez votre nom et votre prénom.'
  }
  if (!PHONE_PATTERN.test(form.phone.replace(/[\s.-]/g, ''))) {
    errors.phone = 'Numéro à 10 chiffres commençant par 05, 06 ou 07.'
  }
  if (!form.wilaya) {
    errors.wilaya = 'Choisissez votre wilaya.'
  }
  if (form.commune.trim().length < 2) {
    errors.commune = 'Indiquez votre commune.'
  }
  if (form.address.trim().length < 10) {
    errors.address = 'Adresse trop courte : rue, numéro, repère éventuel.'
  }

  return errors
}

export default function Commande() {
  const { items, subtotal, clear } = useCart()
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [confirmed, setConfirmed] = useState<OrderDraft | null>(null)

  const deliveryFee = DELIVERY_FEES[form.delivery_type]

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => {
      const next = { ...current, [key]: value }
      // Une fois la première tentative d’envoi faite, on revalide à chaque frappe.
      if (submitted) setErrors(validate(next))
      return next
    })
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)

    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      document.querySelector<HTMLElement>('[data-error="true"]')?.focus()
      return
    }

    const wilayaName = wilayas.find((w) => w.code === form.wilaya)?.name ?? form.wilaya

    const order: OrderDraft = {
      reference: generateReference(),
      full_name: form.full_name.trim(),
      phone: form.phone.replace(/[\s.-]/g, ''),
      wilaya: wilayaName,
      commune: form.commune.trim(),
      address: form.address.trim(),
      delivery_type: form.delivery_type,
      items: items.map((line) => ({
        product_id: line.product.id,
        name: line.product.name,
        unit_price: line.product.price,
        quantity: line.quantity,
        line_total: line.product.price * line.quantity,
      })),
      subtotal,
      delivery_fee: deliveryFee,
      total: subtotal + deliveryFee,
      created_at: new Date().toISOString(),
    }

    // Pas de backend aujourd’hui : la commande part dans la console.
    // Demain, c’est un insert dans `orders` + `order_items`.
    console.log('Nouvelle commande Dar Chic', order)

    setConfirmed(order)
    clear()
    window.scrollTo({ top: 0 })
  }

  /* ——— Écran de confirmation ——— */
  if (confirmed) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-14 sm:px-8 sm:py-20">
        <p className="label text-gris">Merci, {confirmed.full_name.split(' ')[0]}</p>
        <h1 className="mt-3 font-display text-4xl font-black uppercase leading-[0.9] tracking-[-0.05em] sm:text-6xl">
          Commande confirmée
        </h1>
        <p className="mt-4 font-mono text-2xl font-bold sm:text-3xl">{confirmed.reference}</p>
        <p className="mt-6 max-w-[46ch] text-sm leading-relaxed text-gris">
          On vous appelle au <span className="font-mono text-noir">{formatPhone(confirmed.phone)}</span> dans les
          prochaines heures pour confirmer. Vous paierez{' '}
          <span className="font-mono font-bold text-noir">{formatDA(confirmed.total)}</span> au
          livreur, à la réception.
        </p>

        <div className="mt-10 bg-gris-clair p-6">
          <div className="flex items-baseline justify-between border-b border-filet pb-3">
            <span className="label text-gris">Bon de commande</span>
            <span className="font-mono text-sm font-bold">{confirmed.reference}</span>
          </div>

          <ul className="divide-y divide-filet">
            {confirmed.items.map((line) => (
              <li key={line.product_id} className="flex justify-between gap-4 py-2.5 text-sm">
                <span>
                  {line.name}
                  <span className="ml-2 font-mono text-xs text-gris">×{line.quantity}</span>
                </span>
                <span className="shrink-0 font-mono">{formatDA(line.line_total)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-2 pt-2">
            <Totaux
              subtotal={confirmed.subtotal}
              deliveryFee={confirmed.delivery_fee}
              deliveryLabel={DELIVERY_LABELS[confirmed.delivery_type]}
            />
          </div>

          <p className="mt-4 border-t border-filet pt-3 text-xs leading-relaxed text-gris">
            Livraison à <span className="text-noir">{confirmed.address}</span>, {confirmed.commune},{' '}
            {confirmed.wilaya}.
          </p>
        </div>

        <Link
          to="/"
          className="dc-focus dc-press label mt-10 inline-block rounded-full bg-noir px-6 py-3.5 text-blanc hover:bg-noir/85"
        >
          Retour à la boutique
        </Link>
      </section>
    )
  }

  /* ——— Panier vide : on ne laisse pas commander du vent ——— */
  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-8">
        <h1 className="font-display text-3xl font-black uppercase tracking-[-0.05em] sm:text-5xl">
          Aucun article à commander
        </h1>
        <p className="mx-auto mt-4 max-w-[38ch] text-sm leading-relaxed text-gris">
          Ajoutez au moins une pièce au panier avant de remplir le bon de livraison.
        </p>
        <Link
          to="/"
          className="dc-focus dc-press label mt-8 inline-block rounded-full bg-noir px-6 py-3.5 text-blanc hover:bg-noir/85"
        >
          Voir la collection
        </Link>
      </section>
    )
  }

  /* ——— Formulaire ——— */
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-8 sm:py-14">
      <div className="border-b-2 border-noir pb-4">
        <h1 className="font-display text-3xl font-black uppercase leading-none tracking-[-0.05em] sm:text-5xl">
          Livraison
        </h1>
        <p className="mt-3 text-sm text-gris">
          Pas de paiement en ligne. Vous payez en espèces, au livreur, quand le colis est dans vos
          mains.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-8 gap-12 lg:grid lg:grid-cols-[1fr_22rem] lg:items-start"
      >
        <div className="space-y-6">
          <Field id="full_name" label="Nom complet" error={errors.full_name} required>
            <input
              id="full_name"
              name="full_name"
              type="text"
              autoComplete="name"
              placeholder="Amina Belkacem"
              value={form.full_name}
              data-error={Boolean(errors.full_name)}
              aria-invalid={Boolean(errors.full_name)}
              aria-describedby={errors.full_name ? 'full_name-error' : undefined}
              onChange={(e) => update('full_name', e.target.value)}
              className={`${fieldClass} ${fieldBorder(Boolean(errors.full_name))}`}
            />
          </Field>

          <Field
            id="phone"
            label="Téléphone"
            hint="C’est ce numéro que le livreur appellera."
            error={errors.phone}
            required
          >
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="0555 12 34 56"
              value={form.phone}
              data-error={Boolean(errors.phone)}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
              onChange={(e) => update('phone', e.target.value)}
              className={`${fieldClass} ${fieldBorder(Boolean(errors.phone))} font-mono`}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="wilaya" label="Wilaya" error={errors.wilaya} required>
              <select
                id="wilaya"
                name="wilaya"
                autoComplete="address-level1"
                value={form.wilaya}
                data-error={Boolean(errors.wilaya)}
                aria-invalid={Boolean(errors.wilaya)}
                aria-describedby={errors.wilaya ? 'wilaya-error' : undefined}
                onChange={(e) => update('wilaya', e.target.value)}
                className={`${fieldClass} ${fieldBorder(Boolean(errors.wilaya))}`}
              >
                <option value="">Choisir une wilaya…</option>
                {wilayas.map((wilaya) => (
                  <option key={wilaya.code} value={wilaya.code}>
                    {wilaya.code} — {wilaya.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field id="commune" label="Commune" error={errors.commune} required>
              <input
                id="commune"
                name="commune"
                type="text"
                autoComplete="address-level2"
                placeholder="Bir El Djir"
                value={form.commune}
                data-error={Boolean(errors.commune)}
                aria-invalid={Boolean(errors.commune)}
                aria-describedby={errors.commune ? 'commune-error' : undefined}
                onChange={(e) => update('commune', e.target.value)}
                className={`${fieldClass} ${fieldBorder(Boolean(errors.commune))}`}
              />
            </Field>
          </div>

          <Field
            id="address"
            label="Adresse complète"
            hint="Rue, numéro, étage, et un repère si l’adresse est difficile à trouver."
            error={errors.address}
            required
          >
            <textarea
              id="address"
              name="address"
              rows={3}
              autoComplete="street-address"
              placeholder="Cité 1200 logements, bât. C, 3e étage, face à la pharmacie El Nour"
              value={form.address}
              data-error={Boolean(errors.address)}
              aria-invalid={Boolean(errors.address)}
              aria-describedby={errors.address ? 'address-error' : undefined}
              onChange={(e) => update('address', e.target.value)}
              className={`${fieldClass} ${fieldBorder(Boolean(errors.address))} resize-y`}
            />
          </Field>

          <fieldset>
            <legend className="label text-gris">
              Type de livraison <span aria-hidden="true">*</span>
            </legend>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {(Object.keys(DELIVERY_FEES) as DeliveryType[]).map((type) => {
                const isActive = form.delivery_type === type
                return (
                  <label
                    key={type}
                    className={[
                      'flex cursor-pointer gap-3 transition-colors',
                      isActive
                        ? 'border-2 border-noir p-[15px]'
                        : 'border border-filet p-4 hover:border-gris',
                    ].join(' ')}
                  >
                    <input
                      type="radio"
                      name="delivery_type"
                      value={type}
                      checked={isActive}
                      onChange={() => update('delivery_type', type)}
                      className="dc-focus mt-1 h-4 w-4 shrink-0 accent-noir"
                    />
                    <span className="min-w-0">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="text-sm font-medium">{DELIVERY_LABELS[type]}</span>
                        <span className="shrink-0 font-mono text-sm font-bold">
                          {formatDA(DELIVERY_FEES[type])}
                        </span>
                      </span>
                      <span className="mt-1 block text-xs leading-snug text-gris">
                        {DELIVERY_HINTS[type]}
                      </span>
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>
        </div>

        {/* ——— Récapitulatif ——— */}
        <aside className="mt-10 bg-gris-clair p-6 lg:sticky lg:top-24 lg:mt-0">
          <h2 className="label text-gris">Récapitulatif</h2>

          <ul className="mt-3 divide-y divide-filet border-b border-filet">
            {items.map((line) => (
              <li key={line.product.id} className="flex justify-between gap-3 py-2.5 text-sm">
                <span className="min-w-0">
                  {line.product.name}
                  <span className="ml-2 font-mono text-xs text-gris">×{line.quantity}</span>
                </span>
                <span className="shrink-0 font-mono">
                  {formatDA(line.product.price * line.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-2">
            <Totaux
              subtotal={subtotal}
              deliveryFee={deliveryFee}
              deliveryLabel={DELIVERY_LABELS[form.delivery_type]}
            />
          </div>

          <button
            type="submit"
            className="dc-focus dc-press label mt-6 w-full rounded-full bg-terre px-6 py-4 text-blanc hover:bg-terre/90"
          >
            Confirmer ma commande
          </button>

          {submitted && Object.keys(errors).length > 0 ? (
            <p role="alert" className="mt-4 text-center text-xs font-semibold text-noir">
              Il reste <span className="font-mono">{Object.keys(errors).length}</span> champ
              {Object.keys(errors).length > 1 ? 's' : ''} à corriger.
            </p>
          ) : (
            <Link
              to="/panier"
              className="dc-focus dc-press mt-3 block text-center text-xs text-gris underline underline-offset-2 hover:text-noir"
            >
              Modifier mon panier
            </Link>
          )}
        </aside>
      </form>
    </section>
  )
}
