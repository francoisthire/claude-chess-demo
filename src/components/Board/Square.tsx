import { memo } from 'react';
import type { Square as SquareType, Piece as PieceType } from '../../types/chess';
import { isLightSquare } from '../../types/chess';
import { Piece } from '../../assets/pieces';
import styles from './Board.module.css';

interface SquareProps {
  square: SquareType;
  piece: PieceType | null;
  isSelected: boolean;
  isLegalMove: boolean;
  isLastMove: boolean;
  isCheck: boolean;
  onClick: () => void;
}

export const Square = memo(function Square({
  square,
  piece,
  isSelected,
  isLegalMove,
  isLastMove,
  isCheck,
  onClick,
}: SquareProps) {
  const isLight = isLightSquare(square);

  const classNames = [
    styles.square,
    isLight ? styles.light : styles.dark,
    isSelected && styles.selected,
    isLegalMove && styles.legalMove,
    isLastMove && styles.lastMove,
    isCheck && styles.check,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames} onClick={onClick} data-square={square}>
      {piece && (
        <div className={styles.pieceContainer}>
          <Piece type={piece.type} color={piece.color} className={styles.piece} />
        </div>
      )}
      {isLegalMove && !piece && <div className={styles.legalMoveIndicator} />}
      {isLegalMove && piece && <div className={styles.captureIndicator} />}
    </div>
  );
});
