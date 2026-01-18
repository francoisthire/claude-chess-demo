import { useEffect, useCallback, useState, useRef } from 'react';
import { Board } from './components/Board/Board';
import { NewGameModal, type GameConfig } from './components/Modals/NewGameModal';
import { Timer, MoveHistory, GameControls, SettingsPanel } from './components/Controls';
import { useGameStore, getChessInstance } from './store/gameStore';
import { useAIStore } from './store/aiStore';
import { useSettingsStore } from './store/settingsStore';
import { useStockfish } from './hooks/useStockfish';
import { useTimer, TIMER_PRESETS, type TimerConfig } from './hooks/useTimer';
import { DIFFICULTY_LEVELS } from './types/stockfish';
import { playSound, initAudio } from './utils/sounds';
import './App.css';

function App() {
  const {
    turn,
    gameStatus,
    winner,
    fen,
    history,
    currentMoveIndex,
    reset,
    applyUCIMove,
    undo,
    redo,
    goToMove,
    flipBoard,
  } = useGameStore();
  const { enabled, aiColor, level, isThinking, setEnabled, setAIColor, setLevel } = useAIStore();
  const { isReady, getBestMove, loadEngine } = useStockfish();

  // Settings
  const { soundEnabled } = useSettingsStore();

  // Modal state
  const [showNewGameModal, setShowNewGameModal] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoadingEngine, setIsLoadingEngine] = useState(false);

  // Timer configuration (can be made configurable in Phase 7)
  const timerConfig: TimerConfig = TIMER_PRESETS.rapid10;
  const timerEnabled = false; // Disabled by default, enable in Phase 7

  // Timer hook
  const timer = useTimer(timerConfig);
  const prevTurnRef = useRef(turn);
  const prevHistoryLengthRef = useRef(0);
  const gameStartedRef = useRef(false);

  // Initialize audio on first interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      initAudio();
      window.removeEventListener('click', handleFirstInteraction);
    };
    window.addEventListener('click', handleFirstInteraction);
    return () => window.removeEventListener('click', handleFirstInteraction);
  }, []);

  // Play sounds based on game events
  useEffect(() => {
    if (!soundEnabled) return;
    if (history.length === prevHistoryLengthRef.current) return;

    // A new move was made
    if (history.length > prevHistoryLengthRef.current && history.length > 0) {
      const lastMove = history[history.length - 1];
      const chess = getChessInstance();

      if (gameStatus === 'checkmate') {
        playSound('gameEnd');
      } else if (chess.isCheck()) {
        playSound('check');
      } else if (lastMove.san.includes('x')) {
        playSound('capture');
      } else if (lastMove.san === 'O-O' || lastMove.san === 'O-O-O') {
        playSound('castle');
      } else if (lastMove.san.includes('=')) {
        playSound('promote');
      } else {
        playSound('move');
      }
    }

    prevHistoryLengthRef.current = history.length;
  }, [history, soundEnabled, gameStatus]);

  // Déclencher le coup de l'IA quand c'est son tour
  const triggerAIMove = useCallback(async () => {
    if (!enabled || !isReady || gameStatus !== 'playing') return;
    if (turn !== aiColor) return;

    const bestMove = await getBestMove(fen);
    if (bestMove) {
      applyUCIMove(bestMove);
    }
  }, [enabled, isReady, gameStatus, turn, aiColor, fen, getBestMove, applyUCIMove]);

  // Effet pour déclencher l'IA (seulement si on est à la fin de l'historique)
  const isAtEndOfHistory = currentMoveIndex === history.length - 1 || history.length === 0;

  useEffect(() => {
    if (enabled && turn === aiColor && gameStatus === 'playing' && isReady && !isThinking && isAtEndOfHistory) {
      // Petit délai pour que l'UI se mette à jour d'abord
      const timeout = setTimeout(triggerAIMove, 300);
      return () => clearTimeout(timeout);
    }
  }, [enabled, turn, aiColor, gameStatus, isReady, isThinking, triggerAIMove, isAtEndOfHistory]);

  // Démarrer le timer au premier coup
  useEffect(() => {
    if (timerEnabled && history.length === 1 && !gameStartedRef.current) {
      gameStartedRef.current = true;
      timer.start('w');
    }
  }, [timerEnabled, history.length, timer]);

  // Changer le timer quand le tour change
  useEffect(() => {
    if (timerEnabled && gameStartedRef.current && prevTurnRef.current !== turn && gameStatus === 'playing') {
      timer.switchPlayer();
    }
    prevTurnRef.current = turn;
  }, [turn, timerEnabled, timer, gameStatus]);

  // Pause pendant que l'IA réfléchit
  useEffect(() => {
    if (timerEnabled && isThinking) {
      timer.pause();
    } else if (timerEnabled && !isThinking && gameStartedRef.current && gameStatus === 'playing') {
      timer.resume();
    }
  }, [isThinking, timerEnabled, timer, gameStatus]);

  // Arrêter le timer si la partie est terminée
  useEffect(() => {
    if (gameStatus !== 'playing') {
      timer.pause();
    }
  }, [gameStatus, timer]);

  // Gérer le démarrage d'une nouvelle partie
  const handleStartGame = async (config: GameConfig) => {
    if (config.mode === 'ai' && !isReady) {
      // Charger Stockfish à la demande (lazy loading depuis CDN)
      setIsLoadingEngine(true);
      try {
        await loadEngine();
      } finally {
        setIsLoadingEngine(false);
      }
    }

    reset();
    timer.reset();
    gameStartedRef.current = false;

    if (config.mode === 'ai') {
      setEnabled(true);
      // L'IA joue la couleur opposée au joueur
      setAIColor(config.playerColor === 'w' ? 'b' : 'w');
      setLevel(config.difficulty);
    } else {
      setEnabled(false);
    }

    setShowNewGameModal(false);
  };

  // Ouvrir le modal pour nouvelle partie
  const handleNewGame = () => {
    setShowNewGameModal(true);
  };

  const getStatusMessage = () => {
    if (isThinking) {
      return "L'IA réfléchit...";
    }

    switch (gameStatus) {
      case 'checkmate':
        return `Échec et mat ! Les ${winner === 'w' ? 'Blancs' : 'Noirs'} gagnent.`;
      case 'stalemate':
        return 'Pat ! Match nul.';
      case 'draw':
      case 'fifty_move_rule':
        return 'Match nul (règle des 50 coups).';
      case 'threefold_repetition':
        return 'Match nul (triple répétition).';
      case 'insufficient_material':
        return 'Match nul (matériel insuffisant).';
      default: {
        const turnText = turn === 'w' ? 'Blancs' : 'Noirs';
        if (enabled) {
          const isPlayerTurn = turn !== aiColor;
          return isPlayerTurn ? `À vous de jouer (${turnText})` : `Tour de l'IA (${turnText})`;
        }
        return `Trait aux ${turnText}`;
      }
    }
  };

  const isGameOver = gameStatus !== 'playing';
  const difficultyInfo = DIFFICULTY_LEVELS[level];

  // Déterminer qui a gagné en mode IA
  const getGameOverMessage = () => {
    if (gameStatus !== 'checkmate') {
      return getStatusMessage();
    }

    if (enabled) {
      const playerWon = winner !== aiColor;
      return playerWon ? 'Félicitations ! Vous avez gagné !' : "L'IA remporte la partie.";
    }

    return `Les ${winner === 'w' ? 'Blancs' : 'Noirs'} remportent la partie.`;
  };

  const canUndo = currentMoveIndex >= 0;
  const canRedo = currentMoveIndex < history.length - 1;

  return (
    <div className="app">
      <header className="header">
        <h1 className="title">Échecs Premium</h1>
        <button
          className="settings-button"
          onClick={() => setShowSettings(true)}
          title="Paramètres"
        >
          <SettingsIcon />
        </button>
      </header>

      <div className="game-layout">
        {/* Left sidebar - Black timer + controls */}
        <div className="sidebar left">
          {timerEnabled && !timer.isUnlimited && (
            <Timer
              time={timer.blackTime}
              isActive={timer.activeColor === 'b' && !timer.isPaused}
              isTimeout={timer.isBlackTimeout}
              color="black"
              playerName={enabled && aiColor === 'b' ? 'Stockfish' : 'Noirs'}
            />
          )}
          <MoveHistory
            history={history}
            currentMoveIndex={currentMoveIndex}
            onMoveClick={goToMove}
          />
        </div>

        {/* Center - Board */}
        <div className="game-container">
          <div className={`status ${isThinking ? 'thinking' : ''}`}>
            {getStatusMessage()}
          </div>

          <Board />

          <GameControls
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={undo}
            onRedo={redo}
            onFlip={flipBoard}
            onNewGame={handleNewGame}
            isAIMode={enabled}
          />

          {enabled && (
            <div className="ai-info">
              Vous jouez les {aiColor === 'b' ? 'Blancs' : 'Noirs'} contre Stockfish
              <span className="difficulty-badge">{difficultyInfo.name}</span>
            </div>
          )}
        </div>

        {/* Right sidebar - White timer */}
        <div className="sidebar right">
          {timerEnabled && !timer.isUnlimited && (
            <Timer
              time={timer.whiteTime}
              isActive={timer.activeColor === 'w' && !timer.isPaused}
              isTimeout={timer.isWhiteTimeout}
              color="white"
              playerName={enabled && aiColor === 'w' ? 'Stockfish' : 'Blancs'}
            />
          )}
        </div>
      </div>

      {/* Modal de fin de partie */}
      {isGameOver && !showNewGameModal && (
        <div className="game-over-overlay" onClick={handleNewGame}>
          <div className="game-over-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{gameStatus === 'checkmate' ? 'Échec et mat !' : 'Match nul'}</h2>
            <p>{getGameOverMessage()}</p>
            <button className="button" onClick={handleNewGame}>
              Nouvelle partie
            </button>
          </div>
        </div>
      )}

      {/* Modal de nouvelle partie */}
      <NewGameModal
        isOpen={showNewGameModal}
        onStart={handleStartGame}
        isLoading={isLoadingEngine}
      />

      {/* Settings Panel */}
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}

function SettingsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export default App;
