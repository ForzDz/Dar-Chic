import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Fourni par Node au runtime ; déclaré ici pour éviter d'ajouter @types/node.
declare const process: { env: Record<string, string | undefined> }

export default defineConfig({
  plugins: [react()],
  server: {
    // Port attribué par l'environnement s'il existe, sinon le défaut de Vite.
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
  },
})
