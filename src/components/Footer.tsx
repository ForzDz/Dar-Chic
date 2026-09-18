export default function Footer() {
  return (
    <footer className="border-t border-filet">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 text-sm sm:grid-cols-3 sm:px-8">
        <div>
          <p className="font-display text-xl font-black uppercase tracking-[-0.04em]">Dar Chic</p>
          <p className="mt-2 text-gris">Sacs à main cousus en petite série, à Oran.</p>
        </div>
        <div>
          <p className="label text-gris">Livraison</p>
          <p className="mt-3">
            58 wilayas. À domicile <span className="font-mono">600&nbsp;DA</span>, stopdesk{' '}
            <span className="font-mono">400&nbsp;DA</span>.
          </p>
        </div>
        <div>
          <p className="label text-gris">Paiement</p>
          <p className="mt-3">À la livraison, uniquement. Vous ouvrez le colis, puis vous payez.</p>
        </div>
      </div>
    </footer>
  )
}
