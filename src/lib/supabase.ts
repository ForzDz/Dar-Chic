import { createClient } from '@supabase/supabase-js'
import { logErreur } from './log'

/**
 * Client Supabase, unique pour toute l'application.
 * Les deux valeurs viennent du fichier .env (non versionné) et sont injectées par Vite
 * au build. La clé publishable est publique par nature : la sécurité repose sur les
 * politiques RLS de la base, pas sur le secret de cette clé (voir database-schema.sql).
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

/** false si une des deux variables manque : l'écran affiche alors l'erreur au lieu de planter. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey)

if (!isSupabaseConfigured) {
  logErreur(
    'Supabase : configuration incomplète dans .env',
    { VITE_SUPABASE_URL: supabaseUrl ?? '(absente)', VITE_SUPABASE_PUBLISHABLE_KEY: supabasePublishableKey ? '(présente)' : '(absente)' },
  )
}

export const supabase = createClient(supabaseUrl ?? '', supabasePublishableKey ?? '')
