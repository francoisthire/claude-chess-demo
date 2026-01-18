# CLAUDE.md - Guide pour les Agents

## Vue d'ensemble du Projet

**Nom** : Échecs Premium
**Type** : Jeu d'échecs local sur navigateur
**Objectif** : Créer la plus belle UI d'échecs jamais vue, surpassant chess.com

## Commandes Essentielles

```bash
# Installation
npm install

# Développement
npm run dev

# Build production
npm run build

# Tests
npm test

# Lint
npm run lint

# Type check
npm run typecheck
```

## Stack Technique

- **Framework** : React 18 + TypeScript (strict mode)
- **Build** : Vite
- **État** : Zustand
- **Animations** : Framer Motion
- **Styling** : CSS Modules + CSS Variables
- **Logique échecs** : chess.js
- **Moteur IA** : Stockfish 17 (WASM via Web Worker)
- **Tests** : Vitest + React Testing Library

## Architecture du Code

```
src/
├── components/     # Composants React
├── hooks/          # Custom hooks (dont useStockfish)
├── store/          # État Zustand (gameStore, aiStore)
├── workers/        # Web Workers (Stockfish)
├── utils/          # Utilitaires (UCI parser, sons)
├── themes/         # Fichiers CSS des thèmes
├── assets/         # SVG et sons
└── types/          # Types TypeScript
```

## Conventions de Code

### TypeScript
- **Strict mode obligatoire** : Aucun `any` autorisé
- **Types explicites** : Interfaces pour les props, types pour les unions
- **Nomenclature** : PascalCase pour types/interfaces, camelCase pour variables

```typescript
// Bon
interface BoardProps {
  position: Position;
  onMove: (move: Move) => void;
}

// Mauvais
type Props = any;
```

### Composants React
- **Functional components** uniquement
- **Hooks** pour la logique
- **Mémoisation** via `React.memo` pour les composants purs
- **Un composant par fichier**

```typescript
// Structure d'un composant
import { memo } from 'react';
import styles from './Component.module.css';

interface ComponentProps {
  // props typées
}

export const Component = memo(function Component({ prop }: ComponentProps) {
  return <div className={styles.container}>{/* ... */}</div>;
});
```

### CSS
- **CSS Modules** pour le scoping
- **Variables CSS** pour le theming
- **BEM-like** dans les modules : `.container`, `.container_active`
- **Pas de valeurs magiques** : Utiliser des variables

```css
/* Component.module.css */
.container {
  background: var(--board-light);
  transition: var(--transition-base);
}

.container_active {
  box-shadow: var(--shadow-highlight);
}
```

### Animations
- **Framer Motion** pour tout ce qui bouge
- **spring** pour les interactions physiques
- **tween** avec easing pour les transitions UI

```typescript
// Animation de pièce
<motion.div
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ type: "spring", stiffness: 300, damping: 20 }}
/>
```

## Patterns Importants

### Stockfish & Web Worker
```typescript
// workers/stockfish.worker.ts
// Le worker charge Stockfish et communique via postMessage

// Envoi de commandes UCI
worker.postMessage('uci');
worker.postMessage('isready');
worker.postMessage('position fen <FEN>');
worker.postMessage('go depth 10');

// Réception des réponses
worker.onmessage = (e) => {
  const line = e.data;
  if (line.startsWith('bestmove')) {
    const move = line.split(' ')[1]; // ex: "e2e4"
  }
};
```

### Hook useStockfish
```typescript
// hooks/useStockfish.ts
export function useStockfish() {
  const [isReady, setIsReady] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  const getBestMove = useCallback(async (fen: string, level: number) => {
    setIsThinking(true);
    // Envoyer position + go depth
    // Attendre bestmove
    setIsThinking(false);
    return move;
  }, []);

  return { isReady, isThinking, getBestMove };
}
```

### Niveaux de difficulté UCI
```typescript
// Mapping niveau -> commandes UCI
const DIFFICULTY_SETTINGS = {
  1: { skillLevel: 0, depth: 1 },    // Débutant
  2: { skillLevel: 5, depth: 5 },    // Casual
  3: { skillLevel: 10, depth: 10 },  // Intermédiaire
  4: { skillLevel: 15, depth: 15 },  // Avancé
  5: { skillLevel: 20, depth: 20 },  // Expert
  6: { skillLevel: 20, depth: 0 },   // Maximum (temps illimité)
};

// Commandes pour définir le skill level
worker.postMessage('setoption name Skill Level value 10');
worker.postMessage('go depth 10');
```

### Store Zustand
```typescript
// store/gameStore.ts
interface GameState {
  position: string; // FEN
  history: Move[];
  turn: 'white' | 'black';
  // actions
  makeMove: (move: Move) => void;
  undo: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  // implementation
}));
```

### Hook de jeu
```typescript
// hooks/useGame.ts
export function useGame() {
  const { position, makeMove } = useGameStore();
  const chess = useMemo(() => new Chess(position), [position]);

  const isLegalMove = useCallback((from: Square, to: Square) => {
    return chess.moves({ square: from }).includes(to);
  }, [chess]);

  return { isLegalMove, makeMove };
}
```

## Règles de Qualité

### Performance
- **60 FPS minimum** : Pas de jank visible
- **Mémoiser** les callbacks passés aux enfants
- **Éviter** les re-renders inutiles

### Tests
- **Logique de jeu** : Tests unitaires exhaustifs
- **Composants** : Tests d'intégration RTL
- **Pas de snapshot tests** : Trop fragiles

### Accessibilité (basique)
- **Pas de focus** sur l'accessibilité avancée pour v1
- **Contraste suffisant** pour lisibilité
- **Curseurs appropriés** pour les interactions

## Pièges à Éviter

1. **Ne pas utiliser `any`** - Toujours typer explicitement
2. **Ne pas muter le state** - Toujours créer de nouvelles références
3. **Ne pas oublier les dépendances** des hooks
4. **Ne pas hardcoder les couleurs** - Utiliser les variables CSS
5. **Ne pas bloquer le main thread** - Animations CSS/Framer, pas de calculs lourds
6. **Ne JAMAIS appeler Stockfish sur le main thread** - Toujours via Web Worker
7. **Attendre `isready` / `readyok`** avant d'envoyer des commandes à Stockfish
8. **Gérer le timeout** - Stockfish peut prendre du temps sur les niveaux élevés

## Flux de Travail Agent

### Avant de coder
1. Lire ce fichier et ARCHITECTURE.md
2. Comprendre la tâche assignée
3. Identifier les fichiers concernés
4. Vérifier les types existants

### Pendant le développement
1. Écrire le code TypeScript strict
2. Respecter les conventions
3. Tester manuellement avec `npm run dev`
4. Vérifier les types avec `npm run typecheck`

### Après le développement
1. S'assurer que `npm run lint` passe
2. S'assurer que `npm test` passe
3. Vérifier visuellement le rendu
4. Documenter les changements notables

## Thèmes Disponibles

Les thèmes définissent les variables CSS suivantes :
- `--board-light` / `--board-dark` : Couleurs des cases
- `--piece-white` / `--piece-black` : Couleurs des pièces
- `--highlight-move` : Couleur de highlight
- `--highlight-check` : Couleur d'échec
- `--shadow-piece` : Ombre des pièces

## Ressources

- **chess.js docs** : https://github.com/jhlywa/chess.js
- **Stockfish npm** : https://www.npmjs.com/package/stockfish
- **Protocole UCI** : https://www.chessprogramming.org/UCI
- **Framer Motion** : https://www.framer.com/motion/
- **Zustand** : https://github.com/pmndrs/zustand

## Contact

Pour toute question d'architecture, consulter ARCHITECTURE.md ou demander à l'architecte principal.
