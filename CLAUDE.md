# Dar Chic — instructions projet

Boutique en ligne de sacs à main pour femmes, à Oran.
**Paiement à la livraison uniquement**, pas de paiement en ligne. Interface en français, mobile-first.

## Stack

- **Vite + React + TypeScript + Tailwind CSS** (Tailwind v3, config dans `tailwind.config.js`)
- React Router pour les pages : `/` (Accueil), `/panier`, `/commande`
- Panier : **Context React** (`src/context/CartContext.tsx`) + `localStorage`. Aucune librairie d'état externe.
- Pas encore de backend : 8 produits en dur dans `src/data/products.ts`, commande dans `console.log`.
- La structure de la future base et ses politiques de sécurité sont documentées dans `database-schema.sql`. Le mettre à jour à chaque évolution du modèle de données.

## Direction artistique — fashion e-commerce

Identité moderne, noir et blanc cassé, typographie énorme. Le **produit** est le sujet, pas le texte ni la décoration.
L'ancienne identité « atelier artisanal » (tampon rond, serif Fraunces, fond crème, bleu marine) est **abandonnée** : ne pas la réintroduire.

### Palette (tokens Tailwind : utiliser les noms, jamais de hex en dur dans les composants)

| Token        | Hex       | Usage                                                              |
| ------------ | --------- | ------------------------------------------------------------------ |
| `noir`       | `#0A0A0A` | Texte, boutons de navigation, barre d'annonce, bande de confiance  |
| `blanc`      | `#F5F3F0` | Fond de page, texte sur noir                                       |
| `gris`       | `#6E6E6E` | Texte secondaire sur fond clair (sur noir : `text-blanc/60`)       |
| `gris-clair` | `#E7E4DF` | « DAR CHIC » géant du hero, fond des images produit, récapitulatifs |
| `filet`      | `#DAD6D0` | Séparateurs, bordures de champs, bordure de la navbar              |
| `terre`      | `#9B4B2E` | **Seul accent.** Badges de stock et boutons d'action, rien d'autre |

**Le terracotta est rare.** Il sert uniquement :
- aux badges de stock (« Plus que 2 ») ;
- aux boutons d'action qui font avancer l'achat : « Ajouter », « Commander », « Confirmer ma commande » ;
- à l'anneau de focus clavier (`.dc-focus`).

Les boutons de navigation (« Voir la collection », « Retour à la boutique ») sont **noirs**. Les erreurs de formulaire sont en **noir**, avec une bordure de champ noire de 2px, jamais en terre.

### Typographies

Un seul fichier Archivo variable (axes `wdth` et `wght`) pour les titres et le texte, plus Space Mono.

| Rôle          | Classe                                                        | Règle                                                  |
| ------------- | ------------------------------------------------------------- | ------------------------------------------------------ |
| Titres        | `font-display font-black uppercase tracking-[-0.05em]`        | Archivo Expanded (largeur 125 %), très gras, énorme, serré |
| Texte         | `font-sans` (par défaut)                                      | Archivo régulier                                       |
| Chiffres      | `font-mono`                                                   | Space Mono                                             |
| Petits labels | `label`                                                       | Archivo, MAJUSCULES, 11px, letter-spacing 0.15em       |

`.font-display` et `.label` sont définis dans `src/index.css`. Pas de serif, nulle part.

### La règle des chiffres

**Tout prix, quantité, total, frais de livraison, stock ou numéro de commande s'écrit en Space Mono (`font-mono`).** Sans exception, y compris au milieu d'une phrase ou d'un label (ex. `Plus que <span className="font-mono">2</span>`).
- Montants : toujours via `formatDA()` (`src/lib/format.ts`), jamais à la main.
- Référence de commande : format `#ORN-xxxx`, via `generateReference()`.

### Arrondis

**Réservés à la navbar flottante (pilule) et aux boutons (`rounded-full`).** Tout le reste a des coins droits : images, cartes produit, champs, sélecteur de quantité, récapitulatifs, cartes de livraison, badges.

### Mise en page

- **Hero** (`Accueil.tsx`, 100svh) : « DAR CHIC » géant en `gris-clair` en fond (une ligne dès 1024px, deux lignes en dessous), photo détourée `public/hero/sac.webp` centrée et calée en bas, qui déborde dessus, un seul bouton « Voir la collection » en bas à gauche, label « Collection 2026 » en bas à droite. La photo est l'élément principal de l'écran : `fetchPriority="high"`, jamais `loading="lazy"`.
  - **Le titre doit rester lisible derrière la photo.** Taille plafonnée : 62 % de la largeur et 40svh sous 1024px, 55 % et `min(52vh, 560px)` au-dessus. Ne pas agrandir sans remesurer, lettre par lettre, la part de chaque lettre masquée par les pixels opaques.
- **Header fixe** : barre d'annonce noire (« Livraison 58 wilayas · Paiement à la livraison ») qui se replie au scroll, et navbar qui devient pilule après 80px (400ms, `cubic-bezier(0.16, 1, 0.3, 1)`).
- **Bande de confiance** (`BandeConfiance.tsx`) sous le hero : fond noir, 4 colonnes (2×2 sur mobile), pictogrammes SVG au trait fin dessinés à la main.
- **Catalogue** : grille éditoriale, 2 colonnes sur mobile, 4 sur desktop. Images 4:5 sur fond `gris-clair`, sans bordure. Sous l'image : nom en petit, prix en Space Mono. Au survol : voile noir à 15 % et bouton « Ajouter » qui apparaît. **Sur tactile (`hover: none`), le bouton reste visible en permanence**, sinon impossible d'ajouter au panier sur téléphone.
- Récapitulatif : sous-total, livraison et total sur des lignes nettement séparées (composant `Totaux`).

### Animations

- Séquence d'entrée du hero en CSS pur (`src/index.css`), 800ms par élément, `both`, **moins de 2s au total**, jouée seulement au premier affichage de l'accueil.
- `prefers-reduced-motion` : aucune animation, tout est visible immédiatement ; la navbar reste en pilule.

### Micro-interactions (toutes sous 500ms)

- **Boutons et liens-boutons** : classe `dc-press` (`src/index.css`) — couleurs en 200ms, retrait `scale(0.98)` au clic en 100ms. L'élément doit être `block`, `inline-block` ou `flex`, sinon le transform ne s'applique pas. Ne pas y ajouter `transition-colors` : l'utilitaire écraserait la transition.
- **Focus clavier** : classe `dc-focus` sur tout élément interactif — anneau terracotta 2px avec offset 2px, uniquement en `:focus-visible`.
- **Ajout au panier** : le compteur de la navbar pulse (`pulse-compteur`, 400ms). **C'est le seul retour visuel, pas de toast.** Pas de pulse au chargement ni quand on retire un article.
- **Catalogue** : le bouton « Ajouter » garde sa transition de 300ms, partagée avec l'apparition au survol ; il reçoit seulement le retrait au clic.
- `prefers-reduced-motion` : ni retrait ni pulse.

## Back-office (/admin)

- **Auth** : Supabase Auth, `signInWithPassword`. La session vit dans `src/context/AuthContext.tsx`, au-dessus du routeur.
- **Pages** : `/admin/login`, `/admin/commandes` (tableau, dépliage des articles, changement de statut), `/admin/produits` (liste + ajout, modification, suppression).
- **Cadre** : `components/admin/AdminLayout.tsx` (barre noire, navigation, Déconnexion) ; `components/admin/RequireAuth.tsx` redirige vers `/admin/login` sans session. Les pages admin n'affichent ni le header boutique ni le pied de page.
- **Statuts de commande** : `nouvelle` (défaut en base), `confirmée`, `expédiée`, `livrée`, `annulée`. Stockés tels quels dans `orders.status`.
- **Design identique à la boutique** : mêmes tokens, `label`, `font-display`, boutons pilule, `dc-focus` et `dc-press`.
- **⚠️ `RequireAuth` n'est que du décor.** Il cache l'écran, il ne protège pas les données : n'importe qui peut interroger l'API Supabase avec la clé publishable. La sécurité réelle viendra des politiques RLS sur `orders`, `order_items` et `products` (lecture et écriture réservées au compte du gérant). Tant qu'elles ne sont pas écrites, ne pas présenter ce back-office comme sécurisé.
- Toute erreur Supabase (lecture, écriture, statut) s'affiche à l'écran avec son code, et la réponse complète part dans la console. Ne jamais masquer une erreur.

## Données : noms de colonnes en ANGLAIS

Les champs produit sont **exactement** : `id`, `name`, `description`, `price`, `image_url`, `stock`.
Ce sont les colonnes de la future base. **Ne jamais les franciser ni les renommer**, sinon tout casse à la connexion.
Même règle pour les commandes (`full_name`, `phone`, `wilaya`, `commune`, `address`, `delivery_type`, `subtotal`, `delivery_fee`, `total`) et les lignes (`product_id`, `unit_price`, `quantity`, `line_total`). Les types sont dans `src/types.ts`.

Le texte affiché reste en français ; seuls les identifiants de données sont en anglais.

## Règles métier

- Livraison : tarif fixe, **600 DA à domicile, 400 DA en stopdesk** (`src/data/livraison.ts`).
- 58 wilayas (`src/data/wilayas.ts`).
- Téléphone : mobile algérien, `0[5-7]` suivi de 8 chiffres.
- La quantité au panier ne dépasse jamais `stock`.
- Au branchement de la base, prix et totaux doivent être **recalculés côté serveur** : ne jamais faire confiance aux montants envoyés par le client.
- Images : **WebP, ≤ 150 Ko chacune** (3G algérienne). Photos produit recadrées en 4:5, 800×1000 (`public/produits/produit-N.webp`). Photo du hero détourée (fond transparent) et recadrée au contenu. Les sources PNG ne doivent pas être référencées dans le code. Les 8 produits ont une vraie photo.

## Ce qu'il ne faut JAMAIS faire

- **Aucune ombre portée, nulle part** (`shadow-*`, `drop-shadow`), navbar comprise.
- **Aucun dégradé**, et aucune couleur hors palette.
- **Pas de cartes produit avec bordure et coins arrondis.**
- **Pas d'arrondi en dehors de la navbar flottante et des boutons.**
- **Pas de terracotta ailleurs que sur les badges de stock et les boutons d'action.**
- **Pas d'emoji dans l'interface**, ni de pictogrammes-emoji comme ✓, ✨, 🛍️. Les pictogrammes sont des SVG au trait fin.
- **Pas de flèches « → » collées aux boutons** (« Commander → », « Voir plus → »). Le libellé suffit.
- **Pas de photo pleine largeur en fond de hero**, ni de librairie d'animation ou d'icônes.
- Pas de franglais dans les noms de champs, pas de français dans les clés de données.
- Pas de librairie externe pour l'état du panier.
