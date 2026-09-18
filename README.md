# Dar Chic

Boutique de sacs à main pour femmes, à Oran. Paiement à la livraison uniquement.

Vite + React + TypeScript + Tailwind. Mobile-first, en français.
**Étape actuelle : interface seule.** Pas de backend, pas de base — les 8 produits
sont écrits en dur dans `src/data/products.ts` et la commande part dans `console.log`.

## Démarrer

```bash
npm install
npm run dev
```

## Structure

```
database-schema.sql        Référence de la future base (products, orders, order_items)
CLAUDE.md                  Règles du projet : DA, données, interdits
public/produits/           Placeholders produit (SVG, à remplacer par les photos)
public/hero/sac-hero.svg   Placeholder du sac détouré du hero
src/
  types.ts                 Product, CartItem, OrderDraft — noms de champs en anglais
  data/products.ts         Le catalogue en dur (futur `select * from products`)
  data/wilayas.ts          Les 58 wilayas
  data/livraison.ts        Tarifs : 600 DA domicile, 400 DA stopdesk
  lib/format.ts            Montants en DA, référence de commande, téléphone
  context/CartContext.tsx  Le panier (Context React + localStorage)
  components/              Header, Footer, BandeConfiance, ProductCard, CartLine, Totaux, Field
  pages/                   Accueil, Panier, Commande
```

## Règles du projet

- **Les champs de données sont en anglais** (`name`, `description`, `price`,
  `image_url`, `stock`) : ce sont déjà les colonnes de la base. Ne pas franciser.
- **Prix, quantités et totaux calculés côté client aujourd'hui seulement.** Au
  branchement de la base, ils devront être recalculés côté serveur — voir les
  notes de sécurité dans `database-schema.sql`.
- **Le panier est dans `localStorage`** (clé `dar-chic:panier:v1`) : il survit au
  changement de page et au rafraîchissement.

## Direction artistique — fashion e-commerce

| Rôle | Token | Hex |
| --- | --- | --- |
| Texte, boutons de navigation, bandes noires | `noir` | `#0A0A0A` |
| Fond de page | `blanc` | `#F5F3F0` |
| Texte secondaire | `gris` | `#6E6E6E` |
| Nom géant du hero, fond des images | `gris-clair` | `#E7E4DF` |
| Séparateurs, bordures | `filet` | `#DAD6D0` |
| Seul accent : badges de stock, boutons d'action | `terre` | `#9B4B2E` |

Titres en **Archivo Expanded** (très gras, majuscules, serré), texte en **Archivo**,
chiffres en **Space Mono**, petits labels en Archivo majuscules 11px.
Aucune ombre, aucun dégradé ; arrondis réservés à la navbar et aux boutons.
Détails et interdits dans `CLAUDE.md`.
