import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SettingsState {
  soundEnabled: boolean;
  showCoordinates: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  highlightMoves: boolean;
  confirmMoves: boolean;
}

export interface SettingsActions {
  setSoundEnabled: (enabled: boolean) => void;
  setShowCoordinates: (show: boolean) => void;
  setAnimationSpeed: (speed: 'slow' | 'normal' | 'fast') => void;
  setHighlightMoves: (highlight: boolean) => void;
  setConfirmMoves: (confirm: boolean) => void;
  resetSettings: () => void;
}

export type SettingsStore = SettingsState & SettingsActions;

const defaultSettings: SettingsState = {
  soundEnabled: false, // Désactivé par défaut
  showCoordinates: true,
  animationSpeed: 'normal',
  highlightMoves: true,
  confirmMoves: false,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaultSettings,

      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setShowCoordinates: (show) => set({ showCoordinates: show }),
      setAnimationSpeed: (speed) => set({ animationSpeed: speed }),
      setHighlightMoves: (highlight) => set({ highlightMoves: highlight }),
      setConfirmMoves: (confirm) => set({ confirmMoves: confirm }),
      resetSettings: () => set(defaultSettings),
    }),
    {
      name: 'chess-settings',
    }
  )
);
