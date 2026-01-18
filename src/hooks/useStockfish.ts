import { useEffect, useRef, useCallback, useState } from 'react';
import { useAIStore } from '../store/aiStore';
import { DIFFICULTY_LEVELS } from '../types/stockfish';

interface UseStockfishReturn {
  isReady: boolean;
  isThinking: boolean;
  getBestMove: (fen: string) => Promise<string | null>;
  stop: () => void;
}

export function useStockfish(): UseStockfishReturn {
  const workerRef = useRef<Worker | null>(null);
  const [isReady, setIsReady] = useState(false);
  const { isThinking, setThinking, setReady, level } = useAIStore();
  const resolveRef = useRef<((move: string | null) => void) | null>(null);

  // Initialiser le worker
  useEffect(() => {
    // Créer le worker depuis le fichier public
    const worker = new Worker('/stockfish.js');
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent) => {
      const line = typeof e.data === 'string' ? e.data : '';

      // Stockfish est prêt
      if (line === 'readyok') {
        setIsReady(true);
        setReady(true);
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
      console.error('Stockfish worker error:', error);
      setThinking(false);
      if (resolveRef.current) {
        resolveRef.current(null);
        resolveRef.current = null;
      }
    };

    // Initialiser UCI
    worker.postMessage('uci');
    worker.postMessage('isready');

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [setThinking, setReady]);

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
  };
}
