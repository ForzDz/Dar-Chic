/**
 * Journalisation.
 *
 * Règle du projet : jamais de donnée cliente dans la console (nom, téléphone,
 * adresse, e-mail de session, jeton). Les réponses utiles au débogage ne sortent
 * qu'en développement ; les erreurs sortent toujours, car elles ne contiennent
 * que le message, le code et l'indice renvoyés par Supabase.
 */
export function logDev(...args: unknown[]): void {
  if (import.meta.env.DEV) console.log(...args)
}

export function logErreur(...args: unknown[]): void {
  console.error(...args)
}
