import { King } from './King';
import { Queen } from './Queen';
import { Rook } from './Rook';
import { Bishop } from './Bishop';
import { Knight } from './Knight';
import { Pawn } from './Pawn';
import type { PieceSymbol, Color } from '../../types/chess';

interface PieceProps {
  type: PieceSymbol;
  color: Color;
  className?: string;
}

const PIECE_COMPONENTS = {
  k: King,
  q: Queen,
  r: Rook,
  b: Bishop,
  n: Knight,
  p: Pawn,
} as const;

export function Piece({ type, color, className }: PieceProps) {
  const PieceComponent = PIECE_COMPONENTS[type];
  const pieceColor = color === 'w' ? 'white' : 'black';

  return <PieceComponent color={pieceColor} className={className} />;
}

export { King, Queen, Rook, Bishop, Knight, Pawn };
