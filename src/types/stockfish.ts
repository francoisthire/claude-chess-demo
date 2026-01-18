export type DifficultyLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface DifficultySettings {
  name: string;
  skillLevel: number;
  depth: number;
  elo: string;
}

export const DIFFICULTY_LEVELS: Record<DifficultyLevel, DifficultySettings> = {
  1: { name: 'Débutant', skillLevel: 0, depth: 1, elo: '~800' },
  2: { name: 'Casual', skillLevel: 5, depth: 5, elo: '~1200' },
  3: { name: 'Intermédiaire', skillLevel: 10, depth: 10, elo: '~1600' },
  4: { name: 'Avancé', skillLevel: 15, depth: 15, elo: '~2000' },
  5: { name: 'Expert', skillLevel: 20, depth: 20, elo: '~2400' },
  6: { name: 'Maximum', skillLevel: 20, depth: 25, elo: '~3500' },
};

export type GameMode = 'pvp' | 'ai';

export interface AIState {
  enabled: boolean;
  aiColor: 'w' | 'b';
  level: DifficultyLevel;
  isThinking: boolean;
  isReady: boolean;
}

export interface AIActions {
  setEnabled: (enabled: boolean) => void;
  setAIColor: (color: 'w' | 'b') => void;
  setLevel: (level: DifficultyLevel) => void;
  setThinking: (thinking: boolean) => void;
  setReady: (ready: boolean) => void;
}

export type AIStore = AIState & AIActions;
