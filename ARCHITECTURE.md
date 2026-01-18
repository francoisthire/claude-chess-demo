# Architecture - Échecs Premium

## Vision Produit

### Objectif Principal
Créer un jeu d'échecs jouable en local sur navigateur desktop avec une interface utilisateur qui surpasse les standards actuels du marché (chess.com, lichess.org).

### Philosophie de Design
- **Élégance sobre** : Interface épurée, animations fluides, feedback visuel subtil mais satisfaisant
- **Immersion** : Ambiance premium qui donne l'impression de jouer sur un vrai échiquier de luxe
- **Fluidité** : Interactions instantanées, transitions douces, zéro friction

### Différenciateurs UI vs Chess.com
| Aspect | Chess.com | Notre Approche |
|--------|-----------|----------------|
| Esthétique | Interface utilitaire, dense | Minimaliste luxueux, respirant |
| Échiquier | Textures plates, pièces 2D | Rendu 3D subtil, ombres réalistes, pièces sculptées |
| Animations | Basiques, parfois saccadées | Physique réaliste, easing naturel |
| Feedback | Pop-ups, notifications intrusives | Micro-interactions élégantes, feedback haptique visuel |
| Ambiance | Absence d'atmosphère | Éclairage d'ambiance, sons ASMR optionnels |

---

## Décisions Produit

### DP-001 : Mode de jeu local avec IA
**Décision** : Le jeu se joue en local avec possibilité de jouer contre Stockfish.

**Modes de jeu** :
1. **Humain vs Humain** - 2 joueurs sur le même écran
2. **Humain vs Stockfish** - Jouer contre l'IA (Blancs ou Noirs au choix)

**Justification** :
- Stockfish tourne entièrement dans le navigateur (WASM)
- Pas de backend nécessaire, tout reste local
- Permet de s'entraîner seul avec un adversaire de qualité
- Niveaux de difficulté ajustables pour tous les joueurs

### DP-002 : Desktop only
**Décision** : Support desktop uniquement, pas de responsive mobile/tablette.

**Justification** :
- Les échecs sur desktop offrent la meilleure expérience (précision souris, grand écran)
- Permet d'exploiter pleinement l'espace écran pour une UI immersive
- Évite les compromis de design mobile

### DP-003 : Thème d'échiquier
**Décision** : Un seul thème premium, exécuté parfaitement.

**Thème retenu** :
- **Classic Wood** - Érable et noyer, rendu bois réaliste avec grain visible, ombres douces, sensation de vrai échiquier en bois massif, sobre et pro

### DP-004 : Sets de pièces
**Décision** : Pièces vectorielles SVG avec effet 3D via ombres et gradients.

**Sets disponibles** :
1. **Staunton Classic** - Design traditionnel des tournois
2. **Modern Minimal** - Lignes épurées, contemporain
3. **Royal Ornate** - Style baroque, détaillé

### DP-005 : Niveaux de difficulté Stockfish
**Décision** : Proposer des niveaux de difficulté compréhensibles.

**Niveaux** :
| Niveau | Nom | ELO approximatif | Implémentation |
|--------|-----|------------------|----------------|
| 1 | Débutant | ~800 | Skill Level 0, depth 1 |
| 2 | Casual | ~1200 | Skill Level 5, depth 5 |
| 3 | Intermédiaire | ~1600 | Skill Level 10, depth 10 |
| 4 | Avancé | ~2000 | Skill Level 15, depth 15 |
| 5 | Expert | ~2400 | Skill Level 20, depth 20 |
| 6 | Maximum | ~3500 | Skill Level 20, temps illimité |

**Justification** :
- Noms explicites plutôt que valeurs techniques
- Progression naturelle pour tous les joueurs
- Le niveau "Maximum" pour les joueurs qui veulent le défi ultime

### DP-006 : Fonctionnalités de jeu
**Inclus** :
- Drag & drop des pièces avec prévisualisation
- Highlight des coups légaux
- Historique des coups (notation algébrique)
- Undo/Redo
- Flip board (retourner l'échiquier)
- Timer optionnel (Blitz, Rapid, Classical)
- Détection automatique échec/mat/pat/nulle
- Promotion des pions avec sélection visuelle
- Prise en passant et roque automatiques
- **Mode vs Stockfish** avec niveaux de difficulté
- **Indicateur "IA réfléchit"** pendant le calcul

**Exclus (pour cette version)** :
- Analyse de position (évaluation en temps réel)
- Import/Export PGN
- Puzzles
- Ouvertures nommées
- Hints/suggestions de coups

### DP-007 : Sons et ambiance
**Décision** : Sons optionnels, désactivés par défaut.

**Sons prévus** :
- Déplacement de pièce (bois/marbre selon thème)
- Capture (impact satisfaisant)
- Échec (tension subtile)
- Mat (conclusion dramatique)
- Timer low (avertissement discret)

---

## Décisions Techniques

### DT-001 : Framework Frontend
**Décision** : **React 18** avec TypeScript strict

**Justification** :
- Écosystème mature et riche
- Excellent support TypeScript
- Hooks pour gestion d'état propre
- Performances optimales avec concurrent features
- Large pool de développeurs/agents

**Alternatives considérées** :
- Vue 3 : Excellent mais écosystème légèrement moins riche
- Svelte : Performances top mais moins mature
- Vanilla JS : Trop verbeux pour cette complexité

### DT-002 : Build Tool
**Décision** : **Vite**

**Justification** :
- HMR ultra-rapide pour le développement
- Build optimisé pour la production
- Configuration minimale
- Support TypeScript natif

### DT-003 : Styling
**Décision** : **CSS Modules** + **CSS Variables** pour les thèmes

**Justification** :
- Scoping automatique des styles
- Performances natives (pas de runtime)
- Variables CSS pour theming dynamique sans JS
- Pas de dépendance supplémentaire

**Alternatives écartées** :
- Tailwind : Trop utilitaire pour un design aussi custom
- Styled-components : Runtime overhead inutile
- Sass : Overkill, CSS moderne suffit

### DT-004 : Animations
**Décision** : **Framer Motion**

**Justification** :
- API déclarative intuitive
- Animations physiques réalistes (spring, inertia)
- Gestion du drag & drop sophistiquée
- Orchestration de séquences complexes
- Exit animations (AnimatePresence)

### DT-005 : Gestion d'état
**Décision** : **Zustand**

**Justification** :
- Léger (< 1KB)
- API simple et intuitive
- Pas de boilerplate
- Support TypeScript excellent
- Middleware pour undo/redo facile

**Alternatives écartées** :
- Redux : Trop verbose pour ce projet
- Context API : Performance sous-optimale pour updates fréquentes
- Jotai/Recoil : Overkill pour notre cas

### DT-006 : Logique d'échecs
**Décision** : **chess.js** pour les règles + implémentation custom pour l'UI

**Justification** :
- chess.js : Librairie battle-tested pour validation des coups
- Pas besoin de réinventer la roue pour les règles complexes (en passant, roque, promotions)
- Focus de notre effort sur l'UI, pas sur la logique métier

### DT-007 : Moteur d'échecs (IA)
**Décision** : **stockfish** (npm package) via Web Worker

**Package** : `stockfish` v17.1 (par nmrugg/Chess.com)

**Justification** :
- Version WASM moderne et performante
- Utilisé par Chess.com en production
- Tourne entièrement dans le navigateur
- Plusieurs "flavors" disponibles (lite ~7MB pour perf, full ~75MB pour force max)
- Communication via protocole UCI standard

**Architecture** :
```
┌─────────────┐     postMessage      ┌─────────────────┐
│  Main Thread│ ◄──────────────────► │   Web Worker    │
│  (React UI) │                      │  (Stockfish)    │
└─────────────┘                      └─────────────────┘
```

**Flavor retenu** : `stockfish-nnue-16-single.js` (single-threaded, ~7MB)
- Pas besoin de CORS headers spéciaux
- Suffisant pour tous les niveaux de difficulté
- Temps de réponse acceptable (< 2s même en niveau max)

**Alternatives considérées** :
- lichess/stockfish.wasm : Nécessite CORS headers, plus complexe à setup
- stockfish.js (ancien) : Version obsolète
- lc0 (Leela Chess Zero) : Trop lourd pour le navigateur

### DT-008 : Rendu de l'échiquier
**Décision** : **SVG** pour les pièces, **CSS Grid** pour l'échiquier

**Justification** :
- SVG : Scalable, animable, stylable
- CSS Grid : Parfait pour une grille 8x8, responsive intrinsèque
- Pas de Canvas : Overkill et moins accessible

### DT-009 : Structure du projet
```
src/
├── components/
│   ├── Board/           # Échiquier et cases
│   ├── Pieces/          # Composants des pièces SVG
│   ├── Controls/        # Boutons, timer, historique
│   ├── Modals/          # Promotion, fin de partie, setup
│   └── Layout/          # Structure générale
├── hooks/
│   ├── useGame.ts       # Hook principal du jeu
│   ├── useDragDrop.ts   # Logique drag & drop
│   ├── useTimer.ts      # Gestion du timer
│   └── useStockfish.ts  # Hook pour l'IA
├── store/
│   ├── gameStore.ts     # État du jeu
│   └── settingsStore.ts # Paramètres (mode, difficulté)
├── workers/
│   └── stockfish.ts     # Web Worker Stockfish
├── utils/
│   ├── chess.ts         # Wrapper chess.js
│   ├── sounds.ts        # Gestion audio
│   └── uci.ts           # Parser protocole UCI
├── themes/
│   └── classic-wood.css
├── assets/
│   ├── pieces/          # SVG des pièces
│   └── sounds/          # Fichiers audio
├── types/
│   ├── chess.ts         # Types échecs
│   └── stockfish.ts     # Types IA
├── App.tsx
├── main.tsx
└── index.css
```

### DT-010 : Testing
**Décision** : **Vitest** + **React Testing Library**

**Justification** :
- Vitest : Intégration native Vite, rapide
- RTL : Tests orientés comportement utilisateur

### DT-011 : Qualité de code
**Décision** : ESLint + Prettier + TypeScript strict

**Configuration** :
- `strict: true` dans tsconfig
- ESLint avec règles React et hooks
- Prettier pour formatage automatique

---

## Architecture Globale

```
┌─────────────────────────────────────────────────────────────┐
│                         App.tsx                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                     Layout                               ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ ││
│  │  │   Header    │  │  GameArea   │  │    Sidebar      │ ││
│  │  │  (minimal)  │  │             │  │  - History      │ ││
│  │  └─────────────┘  │  ┌───────┐  │  │  - Controls     │ ││
│  │                   │  │ Board │  │  │  - Timer        │ ││
│  │                   │  │       │  │  │  - AI Status    │ ││
│  │                   │  └───────┘  │  │  - Settings     │ ││
│  │                   └─────────────┘  └─────────────────┘ ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      State Layer (Zustand)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Game State  │  │  AI State    │  │     Settings     │  │
│  │  - position  │  │  - enabled   │  │  - sounds        │  │
│  │  - history   │  │  - thinking  │  │  - difficulty    │  │
│  │  - turn      │  │  - aiColor   │  │  - timer config  │  │
│  │  - status    │  │  - level     │  │  - playerColor   │  │
│  │  - mode      │  └──────────────┘  └──────────────────┘  │
│  └──────────────┘                                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Logic Layer                              │
│  ┌────────────────────────┐  ┌────────────────────────────┐│
│  │      chess.js          │  │     Stockfish Worker       ││
│  │  - Move validation     │  │  - Best move calculation   ││
│  │  - Game state          │  │  - UCI protocol            ││
│  │  - Legal moves         │  │  - Difficulty settings     ││
│  └────────────────────────┘  └────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## Flux de Données

### Coup Humain
```
User Interaction (click/drag)
         │
         ▼
┌─────────────────┐
│  Event Handler  │
│  (useDragDrop)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Validate Move  │◄──── chess.js
│  (is legal?)    │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
   Yes        No
    │         │
    ▼         ▼
┌────────┐  ┌────────┐
│ Update │  │ Reject │
│ Store  │  │ (snap  │
└───┬────┘  │ back)  │
    │       └────────┘
    ▼
┌─────────────────┐
│  Re-render      │
│  + Trigger AI?  │──────┐
└─────────────────┘      │
                         │ (si mode vs IA et tour de l'IA)
                         ▼
                ┌─────────────────┐
                │  Stockfish      │
                │  Worker         │
                └─────────────────┘
```

### Coup IA (Stockfish)
```
┌─────────────────┐
│  Tour de l'IA   │
│  (après coup    │
│   humain)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Set "thinking" │
│  = true         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Worker:        │
│  position FEN   │
│  go depth X     │
└────────┬────────┘
         │
         ▼ (async, ~0.5-2s)
┌─────────────────┐
│  bestmove e2e4  │
│  (UCI response) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Apply move     │
│  Update store   │
│  thinking=false │
└─────────────────┘
```

---

## Plan de Sécurité et Performance

### Performance
- **Mémoisation** : React.memo sur les cases qui ne changent pas
- **Lazy loading** : Thèmes chargés à la demande
- **SVG sprites** : Pièces groupées en un seul fichier
- **CSS containment** : Isolation des repaints

### Maintenabilité
- **Types stricts** : Aucun `any` autorisé
- **Tests** : Couverture > 80% sur la logique de jeu
- **Documentation** : JSDoc sur les fonctions publiques

---

## Organisation des Équipes (Agents)

### Équipe 1 : Core Engine
**Responsabilité** : Logique de jeu et état
- Intégration chess.js
- Store Zustand
- Types TypeScript
- Tests unitaires logique

### Équipe 2 : Board & Pieces
**Responsabilité** : Rendu visuel de l'échiquier
- Composant Board (CSS Grid)
- Composants Pieces (SVG)
- Système de thèmes
- Animations Framer Motion

### Équipe 3 : Stockfish / IA
**Responsabilité** : Intégration du moteur d'échecs
- Web Worker Stockfish
- Parser UCI
- Hook useStockfish
- Gestion des niveaux de difficulté
- État "IA réfléchit"

### Équipe 4 : Controls & Features
**Responsabilité** : Fonctionnalités périphériques
- Timer
- Historique des coups
- Undo/Redo
- Paramètres
- Sons
- Modal de configuration (choix mode/couleur/difficulté)

### Équipe 5 : Polish & Integration
**Responsabilité** : Finition et cohérence
- Intégration finale
- Tests E2E
- Optimisation perf
- Bug fixes

---

## Plan d'Implémentation (Phases)

> Chaque phase produit un livrable testable.

### Phase 1 : Walking Skeleton (DONE)
- Setup projet (Vite + React + TS)
- Store Zustand + chess.js
- Échiquier basique (Unicode)
- Click to move
- **Testable** : Partie jouable Humain vs Humain

### Phase 2 : Stockfish Basique
- Installer package `stockfish`
- Web Worker pour Stockfish
- Communication UCI basique
- Hook useStockfish
- Mode vs IA (difficulté fixe)
- **Testable** : Jouer contre Stockfish niveau moyen

### Phase 3 : Configuration de Partie
- Modal de nouvelle partie
- Choix du mode (HvH / HvAI)
- Choix de la couleur (Blancs/Noirs)
- Sélection du niveau de difficulté
- Indicateur "IA réfléchit"
- **Testable** : Configurer et lancer une partie vs IA

### Phase 4 : Pièces SVG & Thème
- SVG des pièces Staunton
- Thème Classic Wood
- Ombres et effets visuels
- Highlights améliorés
- **Testable** : UI visuellement proche du final

### Phase 5 : Animations & Drag and Drop
- Framer Motion pour les déplacements
- Drag & drop fluide
- Effet de surélévation
- Snap et retour
- **Testable** : Interactions premium

### Phase 6 : Timer & Historique
- Timer (Blitz/Rapid/Classical)
- Historique des coups
- Navigation dans l'historique
- Undo/Redo
- **Testable** : Partie complète avec timer

### Phase 7 : Polish Final
- Sons (optionnels)
- Panneau de paramètres
- Persistence localStorage
- Optimisation performance
- **Testable** : Version complète

---

## Critères de Succès

### UI/UX
- [ ] Temps de réponse < 16ms (60 FPS constant)
- [ ] Animations fluides sans jank
- [ ] Drag & drop naturel et satisfaisant
- [ ] Feedback visuel clair sur chaque action
- [ ] Esthétique perçue comme "premium"
- [ ] Indicateur clair quand l'IA réfléchit

### Technique
- [ ] 0 erreur TypeScript
- [ ] Build < 10MB (Stockfish WASM inclus)
- [ ] Lighthouse Performance > 90
- [ ] Tests passants à 100%
- [ ] Worker Stockfish ne bloque pas l'UI

### Fonctionnel
- [ ] Toutes les règles d'échecs correctes
- [ ] Aucun coup illégal possible
- [ ] Détection automatique fin de partie
- [ ] Timer précis à la seconde
- [ ] Stockfish répond en < 3s pour tous les niveaux
- [ ] 6 niveaux de difficulté fonctionnels

---

*Document rédigé par l'Architecte Principal*
*Version 1.0*
