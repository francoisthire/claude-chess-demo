import { useState, useCallback, useRef, useEffect } from 'react';

export interface TimerConfig {
  initialTime: number; // en secondes
  increment: number; // en secondes (ajouté après chaque coup)
}

export interface TimerState {
  whiteTime: number;
  blackTime: number;
  isWhiteRunning: boolean;
  isBlackRunning: boolean;
}

export const TIMER_PRESETS: Record<string, TimerConfig> = {
  bullet1: { initialTime: 60, increment: 0 },
  bullet2: { initialTime: 120, increment: 1 },
  blitz3: { initialTime: 180, increment: 0 },
  blitz3_2: { initialTime: 180, increment: 2 },
  blitz5: { initialTime: 300, increment: 0 },
  blitz5_3: { initialTime: 300, increment: 3 },
  rapid10: { initialTime: 600, increment: 0 },
  rapid10_5: { initialTime: 600, increment: 5 },
  rapid15_10: { initialTime: 900, increment: 10 },
  classical30: { initialTime: 1800, increment: 0 },
  unlimited: { initialTime: 0, increment: 0 }, // 0 = pas de timer
};

export function useTimer(config: TimerConfig) {
  const [whiteTime, setWhiteTime] = useState(config.initialTime);
  const [blackTime, setBlackTime] = useState(config.initialTime);
  const [activeColor, setActiveColor] = useState<'w' | 'b' | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);

  // Mettre à jour les temps quand la config change
  useEffect(() => {
    setWhiteTime(config.initialTime);
    setBlackTime(config.initialTime);
    setActiveColor(null);
    setIsPaused(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [config.initialTime]);

  // Timer loop avec précision milliseconde
  useEffect(() => {
    if (activeColor && !isPaused && config.initialTime > 0) {
      lastTickRef.current = Date.now();

      intervalRef.current = window.setInterval(() => {
        const now = Date.now();
        const elapsed = (now - lastTickRef.current) / 1000;
        lastTickRef.current = now;

        if (activeColor === 'w') {
          setWhiteTime((prev) => Math.max(0, prev - elapsed));
        } else {
          setBlackTime((prev) => Math.max(0, prev - elapsed));
        }
      }, 100); // Update every 100ms for smooth display

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [activeColor, isPaused, config.initialTime]);

  // Démarrer le timer pour un joueur
  const start = useCallback((color: 'w' | 'b') => {
    setActiveColor(color);
    setIsPaused(false);
  }, []);

  // Changer de joueur (après un coup) et ajouter l'incrément
  const switchPlayer = useCallback(() => {
    if (activeColor === null) return;

    // Ajouter l'incrément au joueur qui vient de jouer
    if (config.increment > 0) {
      if (activeColor === 'w') {
        setWhiteTime((prev) => prev + config.increment);
      } else {
        setBlackTime((prev) => prev + config.increment);
      }
    }

    // Changer de joueur
    setActiveColor(activeColor === 'w' ? 'b' : 'w');
  }, [activeColor, config.increment]);

  // Pause/Resume
  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  // Reset
  const reset = useCallback(() => {
    setWhiteTime(config.initialTime);
    setBlackTime(config.initialTime);
    setActiveColor(null);
    setIsPaused(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [config.initialTime]);

  // Vérifier si le temps est écoulé
  const isWhiteTimeout = whiteTime <= 0;
  const isBlackTimeout = blackTime <= 0;
  const isUnlimited = config.initialTime === 0;

  return {
    whiteTime,
    blackTime,
    activeColor,
    isPaused,
    isWhiteTimeout,
    isBlackTimeout,
    isUnlimited,
    start,
    switchPlayer,
    pause,
    resume,
    reset,
  };
}
