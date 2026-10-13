import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { logDev, logErreur } from '../lib/log'
import { supabase } from '../lib/supabase'

type AuthContextValue = {
  session: Session | null
  /** true tant qu'on ne sait pas encore si une session existe (évite de rediriger à tort). */
  chargement: boolean
  /** Renvoie le message d'erreur de Supabase, ou null si la connexion réussit. */
  seConnecter: (email: string, motDePasse: string) => Promise<string | null>
  seDeconnecter: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * Session Supabase Auth, partagée par tout le back-office.
 * Attention : savoir qu'une session existe ne protège rien côté base. Les droits réels
 * viennent des politiques RLS (voir database-schema.sql) — ici, c'est uniquement l'affichage.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    let annule = false

    void supabase.auth.getSession().then(({ data, error }) => {
      if (annule) return
      if (error) logErreur('Supabase auth getSession →', error.message)
      setSession(data.session)
      setChargement(false)
    })

    // Connexion, déconnexion, rafraîchissement du jeton, ouverture dans un autre onglet.
    const { data } = supabase.auth.onAuthStateChange((evenement, nouvelleSession) => {
      // L'e-mail de session ne sort pas dans la console : seul l'événement est utile.
      logDev('Supabase auth →', evenement)
      setSession(nouvelleSession)
      setChargement(false)
    })

    return () => {
      annule = true
      data.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      chargement,
      seConnecter: async (email, motDePasse) => {
        const reponse = await supabase.auth.signInWithPassword({ email, password: motDePasse })
        // La réponse contient l'e-mail et les jetons de session : on ne journalise que l'issue.
        if (reponse.error) {
          logErreur('Supabase signInWithPassword →', reponse.error.message)
          return reponse.error.message
        }
        logDev('Supabase signInWithPassword → connexion réussie')
        setSession(reponse.data.session)
        return null
      },
      seDeconnecter: async () => {
        const { error } = await supabase.auth.signOut()
        if (error) logErreur('Supabase signOut →', error.message)
        setSession(null)
      },
    }),
    [session, chargement],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth doit être utilisé à l’intérieur de <AuthProvider>')
  return context
}
