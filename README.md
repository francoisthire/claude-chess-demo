# Échecs Premium

Un jeu d'échecs sur navigateur avec une interface utilisateur premium, conçu pour surpasser les standards actuels du marché.

## Aperçu

Échecs Premium est un jeu d'échecs local jouable directement dans le navigateur. L'accent est mis sur une expérience visuelle exceptionnelle avec des animations fluides, des thèmes luxueux et une attention particulière aux détails d'interaction.

## Fonctionnalités

- **Jeu complet** : Toutes les règles d'échecs (roque, en passant, promotion)
- **Mode vs Stockfish** : Jouer contre le moteur d'échecs le plus fort au monde
- **6 niveaux de difficulté** : De Débutant (~800 ELO) à Maximum (~3500 ELO)
- **Interface premium** : Design épuré avec rendu pseudo-3D des pièces
- **Thème Classic Wood** : Érable et noyer avec rendu bois réaliste
- **Drag & Drop** : Déplacement fluide avec prévisualisation
- **Timer** : Modes Blitz, Rapid et Classical
- **Historique** : Notation algébrique avec navigation
- **Sons** : Effets sonores immersifs (optionnels)

## Installation

```bash
# Cloner le repository
git clone <repo-url>
cd chess

# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build pour production
npm run build
```

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run preview` | Prévisualiser le build |
| `npm test` | Lancer les tests |
| `npm run lint` | Vérifier le linting |
| `npm run typecheck` | Vérifier les types |

## Stack Technique

- **React 18** - UI déclarative
- **TypeScript** - Typage strict
- **Vite** - Build rapide
- **Zustand** - Gestion d'état
- **Framer Motion** - Animations
- **chess.js** - Logique d'échecs
- **Stockfish 17** - Moteur IA (WASM)
- **CSS Modules** - Styling scopé

## Structure du Projet

```
src/
├── components/     # Composants UI
│   ├── Board/      # Échiquier
│   ├── Pieces/     # Pièces SVG
│   ├── Controls/   # Timer, historique
│   └── Layout/     # Structure page
├── hooks/          # Logique réutilisable
├── store/          # État global
├── themes/         # Styles des thèmes
└── types/          # Types TypeScript
```

## Configuration Requise

- Node.js 18+
- Navigateur moderne (Chrome, Firefox, Safari, Edge)
- Résolution desktop (1280px minimum recommandé)

## Documentation

- [Architecture](./ARCHITECTURE.md) - Décisions techniques et produit
- [Guide Agent](./CLAUDE.md) - Conventions de code

## Licence

MIT
