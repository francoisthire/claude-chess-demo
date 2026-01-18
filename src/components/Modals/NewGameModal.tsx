import { useState } from 'react';
import { DIFFICULTY_LEVELS, type DifficultyLevel, type GameMode } from '../../types/stockfish';
import type { Color } from '../../types/chess';
import styles from './NewGameModal.module.css';

interface NewGameModalProps {
  isOpen: boolean;
  onStart: (config: GameConfig) => void;
  isLoading?: boolean;
}

export interface GameConfig {
  mode: GameMode;
  playerColor: Color;
  difficulty: DifficultyLevel;
}

export function NewGameModal({ isOpen, onStart, isLoading = false }: NewGameModalProps) {
  const [mode, setMode] = useState<GameMode>('ai');
  const [playerColor, setPlayerColor] = useState<Color>('w');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(3);

  if (!isOpen) return null;

  const handleStart = () => {
    if (isLoading) return;
    onStart({ mode, playerColor, difficulty });
  };

  const difficultyInfo = DIFFICULTY_LEVELS[difficulty];

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Nouvelle Partie</h2>

        {/* Mode de jeu */}
        <div className={styles.section}>
          <label className={styles.label}>Mode de jeu</label>
          <div className={styles.options}>
            <button
              className={`${styles.option} ${mode === 'pvp' ? styles.selected : ''}`}
              onClick={() => setMode('pvp')}
            >
              <span className={styles.optionIcon}>👥</span>
              <span className={styles.optionText}>2 Joueurs</span>
            </button>
            <button
              className={`${styles.option} ${mode === 'ai' ? styles.selected : ''}`}
              onClick={() => setMode('ai')}
            >
              <span className={styles.optionIcon}>🤖</span>
              <span className={styles.optionText}>vs Stockfish</span>
            </button>
          </div>
        </div>

        {/* Choix de couleur (uniquement en mode IA) */}
        {mode === 'ai' && (
          <div className={styles.section}>
            <label className={styles.label}>Vous jouez les</label>
            <div className={styles.options}>
              <button
                className={`${styles.option} ${styles.colorOption} ${playerColor === 'w' ? styles.selected : ''}`}
                onClick={() => setPlayerColor('w')}
              >
                <span className={styles.piecePreview}>♔</span>
                <span className={styles.optionText}>Blancs</span>
              </button>
              <button
                className={`${styles.option} ${styles.colorOption} ${playerColor === 'b' ? styles.selected : ''}`}
                onClick={() => setPlayerColor('b')}
              >
                <span className={styles.piecePreview} style={{ color: '#333' }}>♚</span>
                <span className={styles.optionText}>Noirs</span>
              </button>
            </div>
          </div>
        )}

        {/* Niveau de difficulté (uniquement en mode IA) */}
        {mode === 'ai' && (
          <div className={styles.section}>
            <label className={styles.label}>
              Difficulté : <strong>{difficultyInfo.name}</strong>
              <span className={styles.elo}>{difficultyInfo.elo}</span>
            </label>
            <input
              type="range"
              min="1"
              max="6"
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value) as DifficultyLevel)}
              className={styles.slider}
            />
            <div className={styles.difficultyLabels}>
              <span>Débutant</span>
              <span>Maximum</span>
            </div>
          </div>
        )}

        {/* Bouton Start */}
        <button
          className={styles.startButton}
          onClick={handleStart}
          disabled={isLoading}
        >
          {isLoading ? 'Chargement de Stockfish...' : 'Commencer'}
        </button>
      </div>
    </div>
  );
}
