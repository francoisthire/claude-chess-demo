import { create } from 'zustand';
import type { AIStore, DifficultyLevel } from '../types/stockfish';

export const useAIStore = create<AIStore>((set) => ({
  // State
  enabled: false,
  aiColor: 'b', // L'IA joue les Noirs par défaut
  level: 3 as DifficultyLevel, // Niveau Intermédiaire par défaut
  isThinking: false,
  isReady: false,

  // Actions
  setEnabled: (enabled: boolean) => set({ enabled }),
  setAIColor: (color: 'w' | 'b') => set({ aiColor: color }),
  setLevel: (level: DifficultyLevel) => set({ level }),
  setThinking: (thinking: boolean) => set({ isThinking: thinking }),
  setReady: (ready: boolean) => set({ isReady: ready }),
}));
