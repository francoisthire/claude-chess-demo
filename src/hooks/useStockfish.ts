import { useRef, useCallback, useState } from 'react';
import { useAIStore } from '../store/aiStore';
import { DIFFICULTY_LEVELS } from '../types/stockfish';

// CDN URL for Stockfish - much faster than loading from GitHub Pages
const STOCKFISH_CDN_URL = 'https://cdn.jsdelivr.net/npm/stockfish@17/src/stockfish-17.1-lite-single-03e3232.js';

interface UseStockfishReturn {
  isReady: boolean;
  isThinking: boolean;
  loadProgress: number; // 0-100
  getBestMove: (fen: string) => Promise<string | null>;
  stop: () => void;
  loadEngine: () => Promise<void>;
}

// Créer un worker depuis une URL cross-origin via blob
async function createWorkerFromURL(url: string, onProgress?: (progress: number) => void): Promise<Worker> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch Stockfish: ${response.status}`);
  }

  const contentLength = response.headers.get('content-length');
  const total = contentLength ? parseInt(contentLength, 10) : 0;

  if (!response.body) {
    // Fallback sans progression
    const text = await response.text();
    const blob = new Blob([text], { type: 'application/javascript' });
    return new Worker(URL.createObjectURL(blob));
  }

  // Lire avec progression
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    chunks.push(value);
    received += value.length;

    if (total && onProgress) {
      onProgress(Math.round((received / total) * 100));
    }
  }

  const blob = new Blob(chunks as BlobPart[], { type: 'application/javascript' });
  const blobUrl = URL.createObjectURL(blob);
  return new Worker(blobUrl);
}

export function useStockfish(): UseStockfishReturn {
  const workerRef = useRef<Worker | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const { isThinking, setThinking, setReady, level } = useAIStore();
  const resolveRef = useRef<((move: string | null) => void) | null>(null);

  // Charger le moteur à la demande (lazy loading)
  const loadEngine = useCallback(async () => {
    if (workerRef.current || isLoading) return;

    setIsLoading(true);
    setLoadProgress(0);

    try {
      // Créer le worker depuis le CDN via blob (contourne CORS)
      const worker = await createWorkerFromURL(STOCKFISH_CDN_URL, setLoadProgress);
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
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, setThinking, setReady]);

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
    loadProgress,
    getBestMove,
    stop,
    loadEngine,
  };
}
