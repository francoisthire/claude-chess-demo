import styles from './GameControls.module.css';

interface GameControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onFlip: () => void;
  onNewGame: () => void;
  isAIMode?: boolean;
}

export function GameControls({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onFlip,
  onNewGame,
  isAIMode = false,
}: GameControlsProps) {
  return (
    <div className={styles.container}>
      <button
        className={styles.button}
        onClick={onUndo}
        disabled={!canUndo || isAIMode}
        title={isAIMode ? 'Undo désactivé en mode IA' : 'Annuler le dernier coup'}
      >
        <UndoIcon />
        <span>Undo</span>
      </button>

      <button
        className={styles.button}
        onClick={onRedo}
        disabled={!canRedo || isAIMode}
        title={isAIMode ? 'Redo désactivé en mode IA' : 'Refaire le coup'}
      >
        <RedoIcon />
        <span>Redo</span>
      </button>

      <button className={styles.button} onClick={onFlip} title="Retourner le plateau">
        <FlipIcon />
        <span>Flip</span>
      </button>

      <button className={`${styles.button} ${styles.newGame}`} onClick={onNewGame} title="Nouvelle partie">
        <NewGameIcon />
        <span>New</span>
      </button>
    </div>
  );
}

function UndoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 10h10a5 5 0 0 1 5 5v2" />
      <polyline points="3 10 8 5 8 15 3 10" />
    </svg>
  );
}

function RedoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10H11a5 5 0 0 0-5 5v2" />
      <polyline points="21 10 16 5 16 15 21 10" />
    </svg>
  );
}

function FlipIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 16V4M7 4L3 8M7 4l4 4" />
      <path d="M17 8v12M17 20l4-4M17 20l-4-4" />
    </svg>
  );
}

function NewGameIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}
