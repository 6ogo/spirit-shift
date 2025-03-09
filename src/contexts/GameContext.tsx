
import React, { createContext, useContext, useState, useReducer, useEffect } from 'react';

// Types
export type ElementType = 'spirit' | 'fire' | 'water' | 'earth' | 'air';

export interface PlayerState {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  isJumping: boolean;
  currentElement: ElementType;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
}

export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  score: number;
  level: number;
  player: PlayerState;
  availableElements: ElementType[];
}

type GameAction = 
  | { type: 'START_GAME' }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' }
  | { type: 'END_GAME' }
  | { type: 'PLAYER_MOVE', payload: { x: number, y: number } }
  | { type: 'PLAYER_JUMP' }
  | { type: 'PLAYER_LAND' }
  | { type: 'CHANGE_ELEMENT', payload: ElementType }
  | { type: 'UPDATE_HEALTH', payload: number }
  | { type: 'UPDATE_ENERGY', payload: number }
  | { type: 'UPDATE_SCORE', payload: number };

// Initial state
const initialPlayerState: PlayerState = {
  x: 100,
  y: 300,
  velocityX: 0,
  velocityY: 0,
  isJumping: false,
  currentElement: 'spirit',
  health: 100,
  maxHealth: 100,
  energy: 100,
  maxEnergy: 100,
};

const initialGameState: GameState = {
  isPlaying: false,
  isPaused: false,
  score: 0,
  level: 1,
  player: initialPlayerState,
  availableElements: ['spirit', 'fire', 'water', 'earth', 'air'],
};

// Game reducer
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'START_GAME':
      return { ...initialGameState, isPlaying: true };
    case 'PAUSE_GAME':
      return { ...state, isPaused: true };
    case 'RESUME_GAME':
      return { ...state, isPaused: false };
    case 'END_GAME':
      return { ...state, isPlaying: false };
    case 'PLAYER_MOVE':
      return {
        ...state,
        player: {
          ...state.player,
          x: action.payload.x,
          y: action.payload.y,
        },
      };
    case 'PLAYER_JUMP':
      return {
        ...state,
        player: {
          ...state.player,
          isJumping: true,
          velocityY: -15, // Jump velocity
        },
      };
    case 'PLAYER_LAND':
      return {
        ...state,
        player: {
          ...state.player,
          isJumping: false,
          velocityY: 0,
        },
      };
    case 'CHANGE_ELEMENT':
      return {
        ...state,
        player: {
          ...state.player,
          currentElement: action.payload,
        },
      };
    case 'UPDATE_HEALTH':
      return {
        ...state,
        player: {
          ...state.player,
          health: Math.max(0, Math.min(state.player.maxHealth, action.payload)),
        },
      };
    case 'UPDATE_ENERGY':
      return {
        ...state,
        player: {
          ...state.player,
          energy: Math.max(0, Math.min(state.player.maxEnergy, action.payload)),
        },
      };
    case 'UPDATE_SCORE':
      return {
        ...state,
        score: state.score + action.payload,
      };
    default:
      return state;
  }
};

// Context
interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  elementColors: Record<ElementType, string>;
  elementNames: Record<ElementType, string>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider component
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  
  const elementColors: Record<ElementType, string> = {
    spirit: '#1A1A1A',
    fire: '#F24236',
    water: '#28C2FF',
    earth: '#4A934A',
    air: '#BBD0FF',
  };
  
  const elementNames: Record<ElementType, string> = {
    spirit: 'Spirit',
    fire: 'Fire',
    water: 'Water',
    earth: 'Earth',
    air: 'Air',
  };
  
  // Handle keyboard input
  useEffect(() => {
    if (!state.isPlaying || state.isPaused) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
        case 'ArrowUp':
        case 'w':
          if (!state.player.isJumping) {
            dispatch({ type: 'PLAYER_JUMP' });
          }
          break;
        case '1':
          dispatch({ type: 'CHANGE_ELEMENT', payload: 'spirit' });
          break;
        case '2':
          dispatch({ type: 'CHANGE_ELEMENT', payload: 'fire' });
          break;
        case '3':
          dispatch({ type: 'CHANGE_ELEMENT', payload: 'water' });
          break;
        case '4':
          dispatch({ type: 'CHANGE_ELEMENT', payload: 'earth' });
          break;
        case '5':
          dispatch({ type: 'CHANGE_ELEMENT', payload: 'air' });
          break;
        case 'Escape':
          dispatch({ type: 'PAUSE_GAME' });
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [state.isPlaying, state.isPaused, state.player.isJumping]);
  
  return (
    <GameContext.Provider value={{ state, dispatch, elementColors, elementNames }}>
      {children}
    </GameContext.Provider>
  );
};

// Custom hook for using the game context
export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
