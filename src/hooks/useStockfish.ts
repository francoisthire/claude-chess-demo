import { useRef, useCallback, useState } from 'react';
import { useAIStore } from '../store/aiStore';
import { DIFFICULTY_LEVELS } from '../types/stockfish';

// Chemin local vers Stockfish (chargé depuis public/)
const STOCKFISH_PATH = import.meta.env.BASE_URL + 'stockfish.js';

interface UseStockfishReturn {
  isReady: boolean;
  isThinking: boolean;
  getBestMove: (fen: string) => Promise<string | null>;
  stop: () => void;
  loadEngine: () => Promise<void>;
}

export function useStockfish(): UseStockfishReturn {
  const workerRef = useRef<Worker | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isThinking, setThinking, setReady, level } = useAIStore();
  const resolveRef = useRef<((move: string | null) => void) | null>(null);

  // Charger le moteur à la demande (lazy loading)
  const loadEngine = useCallback(async () => {
    if (workerRef.current || isLoading || isReady) return;

    setIsLoading(true);

    try {
      // Créer le worker depuis le fichier local
      const worker = new Worker(STOCKFISH_PATH);
      workerRef.current = worker;

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Stockfish initialization timeout'));
        }, 30000);

        worker.onmessage = (e: MessageEvent) => {
          const line = typeof e.data === 'string' ? e.data : '';

          // Stockfish est prêt
          if (line === 'readyok') {
            clearTimeout(timeout);
            setIsReady(true);
            setReady(true);
            setIsLoading(false);
            resolve();
          }

          // On a reçu le meilleur coup
          if (line.startsWith('bestmove')) {
            const parts = line.split(' ');
            const move = parts[1];
            setThinking(false);

            if (resolveRef.current) {
              resolveRef.current(move || null);
              resolveRef.current = null;
            }
          }
        };

        worker.onerror = (error) => {
          clearTimeout(timeout);
          console.error('Stockfish worker error:', error);
          setThinking(false);
          setIsLoading(false);
          if (resolveRef.current) {
            resolveRef.current(null);
            resolveRef.current = null;
          }
          reject(error);
        };

        // Initialiser UCI
        worker.postMessage('uci');
        worker.postMessage('isready');
      });
    } catch (error) {
      console.error('Failed to load Stockfish:', error);
      workerRef.current = null;
      setIsLoading(false);
      throw error;
    }
  }, [isLoading, isReady, setThinking, setReady]);

  // Obtenir le meilleur coup
  const getBestMove = useCallback((fen: string): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!workerRef.current || !isReady) {
        resolve(null);
        return;
      }

      resolveRef.current = resolve;
      setThinking(true);

      const settings = DIFFICULTY_LEVELS[level];
      const worker = workerRef.current;

      // Configurer le niveau de skill
      worker.postMessage(`setoption name Skill Level value ${settings.skillLevel}`);

      // Définir la position
      worker.postMessage(`position fen ${fen}`);

      // Lancer la recherche avec la profondeur configurée
      worker.postMessage(`go depth ${settings.depth}`);

      // Timeout de sécurité (10 secondes)
      setTimeout(() => {
        if (resolveRef.current === resolve) {
          workerRef.current?.postMessage('stop');
        }
      }, 10000);
    });
  }, [isReady, level, setThinking]);

  // Arrêter la recherche
  const stop = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage('stop');
      setThinking(false);
    }
  }, [setThinking]);

  return {
    isReady,
    isThinking,
    getBestMove,
    stop,
    loadEngine,
  };
}
