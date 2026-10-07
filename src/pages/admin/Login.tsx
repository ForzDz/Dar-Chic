import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import Field, { fieldBorder, fieldClass } from '../../components/Field'
import { useAuth } from '../../context/AuthContext'

export default function AdminLogin() {
  const { session, chargement, seConnecter } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)
  const [enCours, setEnCours] = useState(false)

  if (!chargement && session) return <Navigate to="/admin/commandes" replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (enCours) return

    if (!email.trim() || !motDePasse) {
      setErreur('Renseignez votre e-mail et votre mot de passe.')
      return
    }

    setErreur(null)
    setEnCours(true)
    const messageErreur = await seConnecter(email.trim(), motDePasse)
    setEnCours(false)

    if (messageErreur) {
      // Supabase renvoie « Invalid login credentials » : on le traduit sans masquer le reste.
      setErreur(
        /invalid login credentials/i.test(messageErreur)
          ? 'E-mail ou mot de passe incorrect.'
          : messageErreur,
      )
      return
    }

    navigate('/admin/commandes', { replace: true })
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-16 sm:px-8">
      <p className="label text-gris">Back-office</p>
      <h1 className="mt-3 font-display text-4xl font-black uppercase leading-[0.9] tracking-[-0.05em] sm:text-5xl">
        Connexion
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-gris">
        Réservé à la gestion de la boutique : commandes et catalogue.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-6">
        <Field id="email" label="E-mail" required>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${fieldClass} ${fieldBorder(false)}`}
          />
        </Field>

        <Field id="password" label="Mot de passe" required>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            className={`${fieldClass} ${fieldBorder(false)}`}
          />
        </Field>

        <button
          type="submit"
          disabled={enCours}
          className="dc-focus dc-press label w-full rounded-full bg-terre px-6 py-4 text-blanc hover:bg-terre/90 disabled:cursor-not-allowed disabled:bg-filet disabled:text-gris"
        >
          {enCours ? 'Connexion…' : 'Se connecter'}
        </button>

        {erreur ? (
          <div role="alert" className="border-2 border-noir p-4">
            <p className="label">Connexion refusée</p>
            <p className="mt-2 text-sm font-semibold leading-relaxed">{erreur}</p>
          </div>
        ) : null}
      </form>
    </main>
  )
}
