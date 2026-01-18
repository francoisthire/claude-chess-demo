# Gestion des Équipes et Plan d'Implémentation

## Philosophie de Management

En tant qu'architecte et Tech Lead, mon approche est basée sur :
- **Autonomie encadrée** : Chaque agent a une responsabilité claire et les moyens de l'accomplir
- **Interfaces définies** : Les contrats entre équipes sont explicites (types, props, events)
- **Intégration continue** : Merge fréquent sur main, pas de branches longues
- **Communication via code** : Types TypeScript comme source de vérité

---

## Structure des Équipes

### Vue d'ensemble

```
                    ┌─────────────────────┐
                    │   ARCHITECTE/TL     │
                    │   (Coordination)    │
                    └──────────┬──────────┘
                               │
    ┌──────────────┬───────────┼───────────┬──────────────┐
    │              │           │           │              │
    ▼              ▼           ▼           ▼              ▼
┌────────┐  ┌───────────┐  ┌────────┐  ┌─────────┐  ┌─────────┐
│  CORE  │  │ STOCKFISH │  │ BOARD  │  │CONTROLS │  │ POLISH  │
│(Engine)│  │   (IA)    │  │(Visual)│  │(Features│  │  (Int.) │
└────────┘  └───────────┘  └────────┘  └─────────┘  └─────────┘
```

---

## Équipe 1 : Core Engine

### Mission
Construire le moteur de jeu et l'état applicatif.

### Responsabilités
- Intégration de chess.js
- Store Zustand (gameStore)
- Types TypeScript fondamentaux
- Logique de validation des coups
- Gestion de l'historique (undo/redo)
- Tests unitaires de la logique

### Livrables
```
src/
├── store/gameStore.ts
├── utils/chess.ts
├── types/chess.ts
└── __tests__/chess.test.ts
```

### Interface exposée
```typescript
// Ce que les autres équipes peuvent utiliser
interface GameStore {
  // State
  fen: string;
  turn: Color;
  history: Move[];
  gameStatus: GameStatus;
  selectedSquare: Square | null;
  legalMoves: Square[];

  // Actions
  selectSquare: (square: Square) => void;
  makeMove: (from: Square, to: Square, promotion?: PieceType) => boolean;
  undo: () => void;
  redo: () => void;
  reset: () => void;
}
```

### Dépendances
- Aucune (équipe fondation)

### Critères de validation
- [ ] Tous les coups légaux sont acceptés
- [ ] Tous les coups illégaux sont rejetés
- [ ] Détection échec/mat/pat correcte
- [ ] Undo/redo fonctionnel
- [ ] Tests > 90% coverage sur la logique

---

## Équipe 2 : Stockfish / IA

### Mission
Intégrer Stockfish pour permettre de jouer contre l'ordinateur.

### Responsabilités
- Installation et configuration du package stockfish
- Web Worker pour isoler les calculs
- Communication UCI (Universal Chess Interface)
- Hook useStockfish pour les composants
- Gestion des niveaux de difficulté
- État "IA réfléchit"

### Livrables
```
src/
├── workers/
│   └── stockfish.worker.ts
├── hooks/
│   └── useStockfish.ts
├── utils/
│   └── uci.ts              # Parser UCI
├── types/
│   └── stockfish.ts
└── store/
    └── aiStore.ts          # État IA (enabled, thinking, level)
```

### Interface exposée
```typescript
interface UseStockfishReturn {
  isReady: boolean;
  isThinking: boolean;
  getBestMove: (fen: string, level: DifficultyLevel) => Promise<string>;
  stop: () => void;
}

type DifficultyLevel = 1 | 2 | 3 | 4 | 5 | 6;

interface AIStore {
  enabled: boolean;
  aiColor: 'w' | 'b';
  level: DifficultyLevel;
  isThinking: boolean;
  setEnabled: (enabled: boolean) => void;
  setAIColor: (color: 'w' | 'b') => void;
  setLevel: (level: DifficultyLevel) => void;
}
```

### Dépendances
- Package npm `stockfish`
- Types de l'Équipe Core (FEN, Move)

### Critères de validation
- [ ] Stockfish se charge sans bloquer l'UI
- [ ] Temps de réponse < 3s pour tous les niveaux
- [ ] 6 niveaux de difficulté distincts
- [ ] L'IA joue des coups légaux
- [ ] Indicateur "réfléchit" visible pendant le calcul
- [ ] Possibilité d'interrompre le calcul

---

## Équipe 3 : Board & Pieces

### Mission
Créer le rendu visuel de l'échiquier avec une qualité premium.

### Responsabilités
- Composant Board (grille CSS)
- Composants Pieces (SVG)
- Système de thèmes CSS
- Animations Framer Motion des pièces
- Effets visuels (ombres, highlights)

### Livrables
```
src/
├── components/
│   ├── Board/
│   │   ├── Board.tsx
│   │   ├── Board.module.css
│   │   ├── Square.tsx
│   │   └── Square.module.css
│   └── Pieces/
│       ├── Piece.tsx
│       ├── pieces/           # SVG individuels
│       └── PieceRenderer.tsx
├── themes/
│   ├── variables.css         # Variables de base
│   └── classic-wood.css      # Thème unique, exécuté parfaitement
└── assets/pieces/*.svg
```

### Interface exposée
```typescript
interface BoardProps {
  position: Position;        // Depuis le store
  selectedSquare?: Square;
  legalMoves: Square[];
  lastMove?: { from: Square; to: Square };
  isCheck: boolean;
  orientation: 'white' | 'black';
  theme: ThemeName;
  pieceSet: PieceSetName;
  onSquareClick: (square: Square) => void;
  onPieceDragStart: (square: Square) => void;
  onPieceDrop: (from: Square, to: Square) => void;
}
```

### Dépendances
- Types de l'Équipe Core
- Position du store (lecture seule)

### Critères de validation
- [ ] Échiquier 8x8 correctement rendu
- [ ] 64 cases avec coordonnées
- [ ] Pièces SVG de qualité
- [ ] Thème Classic Wood impeccable
- [ ] Animations fluides (60 FPS)
- [ ] Highlight de la case sélectionnée
- [ ] Highlight des coups légaux
- [ ] Highlight du dernier coup
- [ ] Indication visuelle de l'échec

---

## Équipe 4 : Controls & Features

### Mission
Implémenter les fonctionnalités périphériques et les contrôles.

### Responsabilités
- Timer (avec plusieurs modes)
- Historique des coups (notation)
- Panneau de contrôle (boutons)
- Modal de promotion
- Modal de fin de partie
- Panneau de paramètres
- Système de sons

### Livrables
```
src/
├── components/
│   ├── Controls/
│   │   ├── Timer.tsx
│   │   ├── MoveHistory.tsx
│   │   ├── GameControls.tsx    # Undo, redo, flip, new game
│   │   └── SettingsPanel.tsx
│   └── Modals/
│       ├── PromotionModal.tsx
│       └── GameOverModal.tsx
├── hooks/
│   ├── useTimer.ts
│   └── useSettings.ts
├── store/
│   └── settingsStore.ts
├── utils/
│   └── sounds.ts
└── assets/sounds/*.mp3
```

### Interface exposée
```typescript
interface TimerProps {
  initialTime: number;      // en secondes
  increment: number;        // en secondes
  isRunning: boolean;
  onTimeout: () => void;
}

interface MoveHistoryProps {
  moves: Move[];
  currentMoveIndex: number;
  onMoveClick: (index: number) => void;
}

interface SettingsStore {
  soundEnabled: boolean;
  theme: ThemeName;
  pieceSet: PieceSetName;
  boardOrientation: 'white' | 'black';
  timerConfig: TimerConfig;
  // actions
  toggleSound: () => void;
  setTheme: (theme: ThemeName) => void;
  // etc.
}
```

### Dépendances
- Types de l'Équipe Core
- Store de jeu (pour l'historique)

### Critères de validation
- [ ] Timer précis à la seconde
- [ ] Timer pause/resume correct
- [ ] Historique navigable
- [ ] Notation algébrique correcte
- [ ] Modal promotion fonctionnel
- [ ] Modal fin de partie informatif
- [ ] Sons jouent au bon moment
- [ ] Paramètres persistés en localStorage

---

## Équipe 5 : Integration & Polish

### Mission
Assembler le tout, polir l'UX et assurer la qualité finale.

### Responsabilités
- Layout principal (App.tsx)
- Intégration des composants
- Drag & drop global
- Tests E2E
- Optimisation des performances
- Bug fixes
- Cohérence visuelle

### Livrables
```
src/
├── App.tsx
├── components/
│   └── Layout/
│       ├── Layout.tsx
│       ├── Layout.module.css
│       ├── Header.tsx
│       └── Sidebar.tsx
├── hooks/
│   └── useDragDrop.ts
└── e2e/
    └── game.spec.ts
```

### Interface exposée
N/A - Cette équipe consomme les interfaces des autres.

### Dépendances
- Toutes les autres équipes

### Critères de validation
- [ ] Application complète fonctionnelle
- [ ] Drag & drop fluide
- [ ] Aucun bug bloquant
- [ ] Performance > 60 FPS
- [ ] Build production < 500KB
- [ ] Lighthouse > 95

---

## Plan d'Implémentation

> **Principe** : Chaque phase produit un livrable testable.

### Phase 1 : Walking Skeleton (TERMINÉE)
**Responsable** : Architecte
**Statut** : ✅ DONE

**Livrable testable** : Partie Humain vs Humain jouable avec pièces Unicode.

---

### Phase 2 : Stockfish Basique
**Responsable** : Équipe Stockfish
**Pré-requis** : Phase 1

**Tâches** :
1. Installer package `stockfish`
2. Créer le Web Worker
3. Implémenter communication UCI basique
4. Hook useStockfish avec getBestMove()
5. Intégrer au gameStore (trigger après coup humain)
6. Difficulté fixe (niveau 3 - Intermédiaire)

**Livrable testable** : Jouer une partie contre Stockfish niveau moyen.

**Critères de validation** :
- [ ] Stockfish joue automatiquement après le coup humain
- [ ] L'UI ne freeze pas pendant le calcul
- [ ] Les coups de l'IA sont légaux

---

### Phase 3 : Configuration de Partie
**Responsable** : Équipe Controls
**Pré-requis** : Phase 2

**Tâches** :
1. Modal "Nouvelle Partie" avec choix :
   - Mode : Humain vs Humain / Humain vs IA
   - Couleur : Blancs / Noirs (si vs IA)
   - Niveau : 6 niveaux de difficulté
2. Store pour les paramètres de partie
3. Indicateur "L'IA réfléchit..." avec animation
4. Permettre à l'IA de jouer les Blancs (premier coup)

**Livrable testable** : Configurer une partie vs IA avec le niveau et la couleur souhaités.

**Critères de validation** :
- [ ] Modal s'affiche au lancement et après "Nouvelle partie"
- [ ] Choix de couleur fonctionne
- [ ] 6 niveaux distincts en difficulté perçue
- [ ] Indicateur visible quand l'IA calcule

---

### Phase 4 : Pièces SVG & Thème Classic Wood
**Responsable** : Équipe Board
**Pré-requis** : Phase 1

**Tâches** :
1. Sourcer/créer SVG des pièces Staunton
2. Remplacer Unicode par SVG
3. Implémenter thème Classic Wood :
   - Couleurs érable (#F0D9B5) / noyer (#B58863)
   - Texture grain de bois subtile (CSS)
   - Bordure bois foncé
4. Ombres portées des pièces
5. Highlights premium (sélection, coups légaux, dernier coup)

**Livrable testable** : UI visuellement proche du rendu final.

**Critères de validation** :
- [ ] Pièces nettes et reconnaissables
- [ ] Thème bois réaliste
- [ ] Highlights visibles mais élégants

---

### Phase 5 : Animations & Drag and Drop
**Responsable** : Équipe Integration
**Pré-requis** : Phase 4

**Tâches** :
1. Installer Framer Motion
2. Animation de déplacement (spring physics)
3. Drag & drop avec :
   - Pièce qui suit le curseur
   - Surélévation + ombre pendant le drag
   - Preview sur case cible
4. Snap sur case valide / retour animé si invalide

**Livrable testable** : Interactions fluides et satisfaisantes.

**Critères de validation** :
- [ ] 60 FPS constant
- [ ] Drag naturel et responsive
- [ ] Retour élégant si coup invalide

---

### Phase 6 : Timer & Historique
**Responsable** : Équipe Controls
**Pré-requis** : Phase 3

**Tâches** :
1. Composant Timer (configurable: Blitz 3+2, Rapid 10+5, etc.)
2. MoveHistory avec notation algébrique
3. Undo/Redo (désactivé en mode vs IA)
4. Flip board
5. Pause automatique du timer pendant calcul IA

**Livrable testable** : Partie complète avec timer et historique.

---

### Phase 7 : Polish Final
**Responsable** : Équipe Integration
**Pré-requis** : Phases 2-6

**Tâches** :
1. Layout desktop final
2. Sons optionnels (désactivés par défaut)
3. Panneau de paramètres
4. Persistence localStorage
5. Optimisation bundle
6. Bug fixes

**Livrable testable** : Version complète et polie.

---

## Diagramme de Dépendances

```
Phase 1 (Walking Skeleton) ✅
    │
    ├─────────────────┬─────────────────┐
    ▼                 │                 ▼
Phase 2               │            Phase 4
(Stockfish basique)   │           (SVG & Thème)
    │                 │                 │
    ▼                 │                 ▼
Phase 3               │            Phase 5
(Config partie)       │           (Animations/D&D)
    │                 │                 │
    ▼                 │                 │
Phase 6 ◄─────────────┘                 │
(Timer/History)                         │
    │                                   │
    └───────────────────────────────────┘
                      │
                      ▼
               Phase 7 (Polish)
```

**Parallélisation** :
- Phase 2 (Stockfish) et Phase 4 (Visuel) peuvent démarrer en parallèle
- Phase 3 dépend de Phase 2 (besoin de l'IA pour configurer)
- Phase 5 dépend de Phase 4 (besoin des SVG pour animer)
- Phase 6 peut commencer dès Phase 3 terminée
- Phase 7 attend que tout soit prêt

---

## Gestion des Risques

### Risque 1 : Taille du bundle Stockfish
**Impact** : Moyen (temps de chargement)
**Mitigation** :
- Utiliser la version lite (~7MB) plutôt que full (~75MB)
- Lazy loading du worker (charger après le premier rendu)
- Afficher un indicateur de chargement

### Risque 2 : Stockfish bloque l'UI
**Impact** : Élevé (UX catastrophique)
**Mitigation** :
- Web Worker obligatoire (calculs hors main thread)
- Timeout sur les calculs (max 10s)
- Bouton "Annuler" pendant le calcul

### Risque 3 : Complexité du Drag & Drop
**Impact** : Élevé (UX critique)
**Mitigation** : Utiliser Framer Motion qui gère bien ce cas, prototyper tôt

### Risque 4 : Bugs dans les règles d'échecs
**Impact** : Élevé (casse le jeu)
**Mitigation** : S'appuyer sur chess.js qui est battle-tested, tests exhaustifs

### Risque 5 : Communication UCI complexe
**Impact** : Moyen (bugs potentiels)
**Mitigation** :
- Parser UCI simple et testé
- Logs des échanges pour debug
- Gestion des erreurs robuste

---

## Communication Inter-Équipes

### Daily Sync
- Point rapide sur les blocages
- Identification des dépendances immédiates

### Contrats d'Interface
- Les types TypeScript font foi
- Toute modification d'interface = discussion préalable

### Merge Strategy
- Feature branches courtes
- PR review par au moins une autre équipe
- Main toujours déployable

---

*Document rédigé par l'Architecte/Tech Lead*
*Version 1.0*
