import type { Square as ChessSquare, PieceSymbol, Color } from 'chess.js';

export type Square = ChessSquare;
export type { PieceSymbol, Color };

export interface Piece {
  type: PieceSymbol;
  color: Color;
}

export interface Move {
  from: Square;
  to: Square;
  promotion?: PieceSymbol;
}

export type GameStatus =
  | 'playing'
  | 'checkmate'
  | 'stalemate'
  | 'draw'
  | 'threefold_repetition'
  | 'insufficient_material'
  | 'fifty_move_rule';

export interface HistoryMove {
  san: string; // Notation algébrique standard (e.g., "e4", "Nf3", "O-O")
  from: Square;
  to: Square;
  fen: string; // FEN après ce coup
}

export interface GameState {
  fen: string;
  turn: Color;
  selectedSquare: Square | null;
  legalMoves: Square[];
  lastMove: Move | null;
  isCheck: boolean;
  gameStatus: GameStatus;
  winner: Color | null;
  history: HistoryMove[];
  currentMoveIndex: number; // -1 = position initiale, sinon index dans history
  orientation: 'white' | 'black';
}

export interface GameActions {
  selectSquare: (square: Square) => void;
  makeMove: (from: Square, to: Square, promotion?: PieceSymbol) => boolean;
  reset: () => void;
  applyUCIMove: (uciMove: string) => boolean;
  undo: () => boolean;
  redo: () => boolean;
  goToMove: (index: number) => void;
  flipBoard: () => void;
}

export type GameStore = GameState & GameActions;

// Mapping des pièces vers Unicode
export const PIECE_UNICODE: Record<Color, Record<PieceSymbol, string>> = {
  w: {
    k: '♔',
    q: '♕',
    r: '♖',
    b: '♗',
    n: '♘',
    p: '♙',
  },
  b: {
    k: '♚',
    q: '♛',
    r: '♜',
    b: '♝',
    n: '♞',
    p: '♟',
  },
};

// Liste des cases dans l'ordre d'affichage (a8 -> h1)
export const SQUARES: Square[] = [
  'a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8',
  'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7',
  'a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6',
  'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5',
  'a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4',
  'a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3',
  'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2',
  'a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1',
];

export function isLightSquare(square: Square): boolean {
  const file = square.charCodeAt(0) - 97; // a=0, b=1, ...
  const rank = parseInt(square[1]) - 1;   // 1=0, 2=1, ...
  return (file + rank) % 2 === 1;
}
