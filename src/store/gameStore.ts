import { create } from 'zustand';
import { Chess } from 'chess.js';
import type { GameStore, GameStatus, Square, PieceSymbol, HistoryMove } from '../types/chess';

let chess = new Chess();

function getGameStatus(game: Chess): GameStatus {
  if (game.isCheckmate()) return 'checkmate';
  if (game.isStalemate()) return 'stalemate';
  if (game.isThreefoldRepetition()) return 'threefold_repetition';
  if (game.isInsufficientMaterial()) return 'insufficient_material';
  if (game.isDraw()) return 'fifty_move_rule';
  return 'playing';
}

function getLegalMovesForSquare(game: Chess, square: Square): Square[] {
  const moves = game.moves({ square, verbose: true });
  return moves.map((move) => move.to as Square);
}

export const useGameStore = create<GameStore>((set, get) => ({
  // State initial
  fen: chess.fen(),
  turn: chess.turn(),
  selectedSquare: null,
  legalMoves: [],
  lastMove: null,
  isCheck: chess.isCheck(),
  gameStatus: 'playing',
  winner: null,
  history: [],
  currentMoveIndex: -1,
  orientation: 'white',

  // Actions
  selectSquare: (square: Square) => {
    const state = get();
    const piece = chess.get(square);

    // Si une pièce est déjà sélectionnée et qu'on clique sur une case légale -> move
    if (state.selectedSquare && state.legalMoves.includes(square)) {
      get().makeMove(state.selectedSquare, square);
      return;
    }

    // Si on clique sur une de nos pièces -> sélection
    if (piece && piece.color === chess.turn()) {
      const legalMoves = getLegalMovesForSquare(chess, square);
      set({
        selectedSquare: square,
        legalMoves,
      });
      return;
    }

    // Sinon -> déselection
    set({
      selectedSquare: null,
      legalMoves: [],
    });
  },

  makeMove: (from: Square, to: Square, promotion?: PieceSymbol) => {
    const state = get();

    // Si on n'est pas à la fin de l'historique, on ne peut pas jouer
    if (state.currentMoveIndex !== state.history.length - 1 && state.history.length > 0) {
      return false;
    }

    // Vérifier si c'est une promotion de pion
    const piece = chess.get(from);
    const isPromotion =
      piece?.type === 'p' &&
      ((piece.color === 'w' && to[1] === '8') ||
        (piece.color === 'b' && to[1] === '1'));

    // Si c'est une promotion et qu'on n'a pas spécifié la pièce, on promeut en dame par défaut
    const movePromotion = isPromotion ? promotion || 'q' : undefined;

    try {
      const move = chess.move({
        from,
        to,
        promotion: movePromotion,
      });

      if (move) {
        const gameStatus = getGameStatus(chess);
        const winner = gameStatus === 'checkmate' ? (chess.turn() === 'w' ? 'b' : 'w') : null;
        const newFen = chess.fen();

        // Ajouter le coup à l'historique
        const historyMove: HistoryMove = {
          san: move.san,
          from: move.from as Square,
          to: move.to as Square,
          fen: newFen,
        };

        const newHistory = [...state.history, historyMove];

        set({
          fen: newFen,
          turn: chess.turn(),
          selectedSquare: null,
          legalMoves: [],
          lastMove: { from, to, promotion: movePromotion },
          isCheck: chess.isCheck(),
          gameStatus,
          winner,
          history: newHistory,
          currentMoveIndex: newHistory.length - 1,
        });
        return true;
      }
    } catch {
      // Coup invalide
    }

    set({
      selectedSquare: null,
      legalMoves: [],
    });
    return false;
  },

  reset: () => {
    chess = new Chess();
    set({
      fen: chess.fen(),
      turn: chess.turn(),
      selectedSquare: null,
      legalMoves: [],
      lastMove: null,
      isCheck: false,
      gameStatus: 'playing',
      winner: null,
      history: [],
      currentMoveIndex: -1,
    });
  },

  // Appliquer un coup UCI (format: "e2e4" ou "e7e8q" pour promotion)
  applyUCIMove: (uciMove: string) => {
    if (!uciMove || uciMove.length < 4) return false;

    const from = uciMove.slice(0, 2) as Square;
    const to = uciMove.slice(2, 4) as Square;
    const promotion = uciMove.length > 4 ? (uciMove[4] as PieceSymbol) : undefined;

    return get().makeMove(from, to, promotion);
  },

  // Annuler le dernier coup
  undo: () => {
    const state = get();
    if (state.currentMoveIndex < 0) return false;

    const newIndex = state.currentMoveIndex - 1;

    // Reconstruire la position
    chess = new Chess();
    for (let i = 0; i <= newIndex; i++) {
      const move = state.history[i];
      chess.move({ from: move.from, to: move.to });
    }

    const lastMove = newIndex >= 0 ? {
      from: state.history[newIndex].from,
      to: state.history[newIndex].to,
    } : null;

    set({
      fen: chess.fen(),
      turn: chess.turn(),
      selectedSquare: null,
      legalMoves: [],
      lastMove,
      isCheck: chess.isCheck(),
      gameStatus: 'playing',
      winner: null,
      currentMoveIndex: newIndex,
    });

    return true;
  },

  // Refaire le coup annulé
  redo: () => {
    const state = get();
    if (state.currentMoveIndex >= state.history.length - 1) return false;

    const newIndex = state.currentMoveIndex + 1;
    const move = state.history[newIndex];

    chess.move({ from: move.from, to: move.to });

    const gameStatus = getGameStatus(chess);
    const winner = gameStatus === 'checkmate' ? (chess.turn() === 'w' ? 'b' : 'w') : null;

    set({
      fen: chess.fen(),
      turn: chess.turn(),
      selectedSquare: null,
      legalMoves: [],
      lastMove: { from: move.from, to: move.to },
      isCheck: chess.isCheck(),
      gameStatus,
      winner,
      currentMoveIndex: newIndex,
    });

    return true;
  },

  // Aller à un coup spécifique dans l'historique
  goToMove: (index: number) => {
    const state = get();
    if (index < -1 || index >= state.history.length) return;
    if (index === state.currentMoveIndex) return;

    // Reconstruire la position
    chess = new Chess();
    for (let i = 0; i <= index; i++) {
      const move = state.history[i];
      chess.move({ from: move.from, to: move.to });
    }

    const lastMove = index >= 0 ? {
      from: state.history[index].from,
      to: state.history[index].to,
    } : null;

    const gameStatus = getGameStatus(chess);
    const winner = gameStatus === 'checkmate' ? (chess.turn() === 'w' ? 'b' : 'w') : null;

    set({
      fen: chess.fen(),
      turn: chess.turn(),
      selectedSquare: null,
      legalMoves: [],
      lastMove,
      isCheck: chess.isCheck(),
      gameStatus,
      winner,
      currentMoveIndex: index,
    });
  },

  // Retourner le plateau
  flipBoard: () => {
    set((state) => ({
      orientation: state.orientation === 'white' ? 'black' : 'white',
    }));
  },
}));

// Export pour accéder à l'instance chess (lecture seule pour les composants)
export function getChessInstance(): Chess {
  return chess;
}
