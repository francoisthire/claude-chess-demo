import { useCallback, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore, getChessInstance } from '../../store/gameStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useAIStore } from '../../store/aiStore';
import { SQUARES } from '../../types/chess';
import type { Square as SquareType, Piece as PieceType } from '../../types/chess';
import { Piece } from '../../assets/pieces';
import { isLightSquare } from '../../types/chess';
import styles from './Board.module.css';

const SQUARE_SIZE = 70; // 560px / 8

export function Board() {
  const {
    selectedSquare,
    legalMoves,
    lastMove,
    isCheck,
    turn,
    gameStatus,
    orientation,
    selectSquare,
    makeMove,
  } = useGameStore();

  const { enabled: aiEnabled, aiColor, isThinking } = useAIStore();

  const { showCoordinates, highlightMoves } = useSettingsStore();

  const chess = getChessInstance();
  const boardRef = useRef<HTMLDivElement>(null);
  const [draggedPiece, setDraggedPiece] = useState<SquareType | null>(null);
  const pointerPositionRef = useRef({ x: 0, y: 0 });

  // Track pointer position globally during drag
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      pointerPositionRef.current = { x: e.clientX, y: e.clientY };
    };

    if (draggedPiece) {
      window.addEventListener('pointermove', handlePointerMove);
      return () => window.removeEventListener('pointermove', handlePointerMove);
    }
  }, [draggedPiece]);

  // Trouver la position du roi en échec
  const kingInCheck = isCheck ? findKingSquare(chess, turn) : null;

  // Convertir les coordonnées de la souris en case (prend en compte l'orientation)
  const getSquareFromPosition = useCallback((clientX: number, clientY: number): SquareType | null => {
    if (!boardRef.current) return null;

    const rect = boardRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (x < 0 || x >= rect.width || y < 0 || y >= rect.height) return null;

    let file = Math.floor(x / SQUARE_SIZE);
    let rank = 7 - Math.floor(y / SQUARE_SIZE);

    // Inverser si le plateau est retourné
    if (orientation === 'black') {
      file = 7 - file;
      rank = 7 - rank;
    }

    if (file < 0 || file > 7 || rank < 0 || rank > 7) return null;

    const files = 'abcdefgh';
    return `${files[file]}${rank + 1}` as SquareType;
  }, [orientation]);

  // Gérer le clic sur une case
  const handleSquareClick = useCallback(
    (square: SquareType) => {
      if (draggedPiece) return;
      selectSquare(square);
    },
    [selectSquare, draggedPiece]
  );

  // Début du drag
  const handleDragStart = useCallback((square: SquareType) => {
    setDraggedPiece(square);
    selectSquare(square);
  }, [selectSquare]);

  // Fin du drag
  const handleDragEnd = useCallback((fromSquare: SquareType) => {
    if (!draggedPiece) return;

    const { x, y } = pointerPositionRef.current;
    const targetSquare = getSquareFromPosition(x, y);

    if (targetSquare && targetSquare !== fromSquare) {
      makeMove(fromSquare, targetSquare);
    }

    setDraggedPiece(null);
  }, [draggedPiece, getSquareFromPosition, makeMove]);

  const isGameActive = gameStatus === 'playing';

  // Ne pas montrer la sélection/coups légaux quand c'est le tour de l'IA
  const isAITurn = aiEnabled && turn === aiColor;
  const showSelection = !isAITurn && !isThinking;

  // Ordre des cases selon l'orientation
  const displaySquares = orientation === 'black' ? [...SQUARES].reverse() : SQUARES;

  // Helper pour déterminer si on doit afficher les coordonnées sur une case
  const getCoordinates = (square: SquareType, index: number) => {
    const file = square[0]; // a-h
    const rank = square[1]; // 1-8

    // Pour l'orientation blanche : afficher le rang sur la colonne a, la file sur la rangée 1
    // Pour l'orientation noire : afficher le rang sur la colonne h, la file sur la rangée 8
    const displayFile = orientation === 'white'
      ? (index % 8 === 0 ? rank : null) // colonne a (index 0, 8, 16...)
      : (index % 8 === 7 ? rank : null); // colonne h

    const displayRank = orientation === 'white'
      ? (Math.floor(index / 8) === 7 ? file : null) // rangée 1 (dernière ligne affichée)
      : (Math.floor(index / 8) === 7 ? file : null); // rangée 8 (dernière ligne affichée)

    return { displayFile, displayRank };
  };

  return (
    <div className={styles.board} ref={boardRef}>
      {displaySquares.map((square, index) => {
        const piece = chess.get(square) as PieceType | null;
        const isSelected = showSelection && selectedSquare === square;
        const isLegalMove = showSelection && highlightMoves && legalMoves.includes(square);
        const isLastMoveSquare = highlightMoves && (lastMove?.from === square || lastMove?.to === square);
        const isKingInCheck = kingInCheck === square;
        const isLight = isLightSquare(square);
        const isDragging = draggedPiece === square;
        const { displayFile, displayRank } = getCoordinates(square, index);

        const squareClasses = [
          styles.square,
          isLight ? styles.light : styles.dark,
          isSelected && styles.selected,
          isLegalMove && styles.legalMove,
          isLastMoveSquare && styles.lastMove,
          isKingInCheck && styles.check,
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <div
            key={square}
            className={squareClasses}
            onClick={() => handleSquareClick(square)}
            data-square={square}
          >
            {/* Coordinates */}
            {showCoordinates && displayFile && (
              <span className={`${styles.coordinate} ${styles.rank}`}>{displayFile}</span>
            )}
            {showCoordinates && displayRank && (
              <span className={`${styles.coordinate} ${styles.file}`}>{displayRank}</span>
            )}

            {/* Legal move indicator (empty square) */}
            {isLegalMove && !piece && <div className={styles.legalMoveIndicator} />}

            {/* Capture indicator */}
            {isLegalMove && piece && !isDragging && <div className={styles.captureIndicator} />}

            {/* Piece */}
            {piece && (
              <DraggablePiece
                key={`${square}-${piece.type}-${piece.color}`}
                piece={piece}
                isDragging={isDragging}
                canDrag={isGameActive && piece.color === turn}
                onDragStart={() => handleDragStart(square)}
                onDragEnd={() => handleDragEnd(square)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Composant pour une pièce draggable
interface DraggablePieceProps {
  piece: PieceType;
  isDragging: boolean;
  canDrag: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}

function DraggablePiece({
  piece,
  isDragging,
  canDrag,
  onDragStart,
  onDragEnd,
}: DraggablePieceProps) {
  return (
    <motion.div
      className={`${styles.pieceContainer} ${isDragging ? styles.dragging : ''}`}
      drag={canDrag}
      dragMomentum={false}
      dragElastic={0}
      dragSnapToOrigin
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      whileDrag={{
        scale: 1.1,
        zIndex: 1000,
      }}
      style={{
        cursor: canDrag ? 'grab' : 'default',
      }}
    >
      <Piece type={piece.type} color={piece.color} className={styles.piece} />
    </motion.div>
  );
}

function findKingSquare(
  chess: ReturnType<typeof getChessInstance>,
  color: 'w' | 'b'
): SquareType | null {
  for (const square of SQUARES) {
    const piece = chess.get(square);
    if (piece && piece.type === 'k' && piece.color === color) {
      return square;
    }
  }
  return null;
}
