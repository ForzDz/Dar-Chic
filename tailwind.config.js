/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Identité fashion — voir CLAUDE.md
        noir: '#0A0A0A', // Texte, boutons primaires, barre d'annonce, bande de confiance
        blanc: '#F5F3F0', // Fond de page, texte sur noir
        gris: '#6E6E6E', // Texte secondaire (4,6:1 sur blanc)
        'gris-clair': '#E7E4DF', // « DAR CHIC » géant, fond des images produit
        filet: '#DAD6D0', // Séparateurs, bordures de champs et de la navbar
        terre: '#9B4B2E', // Seul accent : badges de stock et boutons d'action, rien d'autre
      },
      fontFamily: {
        // Archivo porte aussi les titres : .font-display (index.css) l'élargit à 125 %.
        sans: ['Archivo', 'system-ui', 'sans-serif'],
        mono: ['"Space Mono"', 'ui-monospace', 'monospace'],
      },
      // Navbar qui se détache des bords au scroll
      transitionDuration: {
        nav: '400ms',
      },
      transitionTimingFunction: {
        nav: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
