import { useRef, useEffect, memo } from 'react';
import type { HistoryMove } from '../../types/chess';
import styles from './MoveHistory.module.css';

interface MoveHistoryProps {
  history: HistoryMove[];
  currentMoveIndex: number;
  onMoveClick: (index: number) => void;
}

export const MoveHistory = memo(function MoveHistory({ history, currentMoveIndex, onMoveClick }: MoveHistoryProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeMoveRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll to active move - only scroll within the container
  useEffect(() => {
    const container = scrollContainerRef.current;
    const activeMove = activeMoveRef.current;

    if (activeMove && container) {
      const containerRect = container.getBoundingClientRect();
      const moveRect = activeMove.getBoundingClientRect();

      // Check if the move is outside the visible area
      const isAbove = moveRect.top < containerRect.top;
      const isBelow = moveRect.bottom > containerRect.bottom;

      if (isAbove || isBelow) {
        // Scroll only the container, not the page
        const scrollTop = activeMove.offsetTop - container.offsetTop - containerRect.height / 2 + moveRect.height / 2;
        container.scrollTo({
          top: Math.max(0, scrollTop),
          behavior: 'smooth',
        });
      }
    }
  }, [currentMoveIndex]);

  // Grouper les coups par paires (blanc, noir)
  const movePairs: Array<{ moveNumber: number; white?: { san: string; index: number }; black?: { san: string; index: number } }> = [];

  for (let i = 0; i < history.length; i += 2) {
    const moveNumber = Math.floor(i / 2) + 1;
    movePairs.push({
      moveNumber,
      white: history[i] ? { san: history[i].san, index: i } : undefined,
      black: history[i + 1] ? { san: history[i + 1].san, index: i + 1 } : undefined,
    });
  }

  if (history.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>Historique</div>
        <div className={styles.empty}>Aucun coup joué</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>Historique</div>
      <div className={styles.moves} ref={scrollContainerRef}>
        {movePairs.map((pair) => (
          <div key={pair.moveNumber} className={styles.movePair}>
            <span className={styles.moveNumber}>{pair.moveNumber}.</span>
            {pair.white && (
              <button
                ref={pair.white.index === currentMoveIndex ? activeMoveRef : null}
                className={`${styles.move} ${pair.white.index === currentMoveIndex ? styles.active : ''}`}
                onClick={() => onMoveClick(pair.white!.index)}
              >
                {pair.white.san}
              </button>
            )}
            {pair.black && (
              <button
                ref={pair.black.index === currentMoveIndex ? activeMoveRef : null}
                className={`${styles.move} ${pair.black.index === currentMoveIndex ? styles.active : ''}`}
                onClick={() => onMoveClick(pair.black!.index)}
              >
                {pair.black.san}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});
