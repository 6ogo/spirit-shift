import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Types
export type ElementType = 'spirit' | 'fire' | 'water' | 'earth' | 'air';

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  element: ElementType;
  canPassThrough: boolean;
}

export interface PlayerState {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  width: number;
  height: number;
  isJumping: boolean;
  isDucking: boolean;
  isMovingLeft: boolean;
  isMovingRight: boolean;
  currentElement: ElementType;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  onPlatform: boolean;
}

export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  gameOver: boolean;
  score: number;
  level: number;
  player: PlayerState;
  platforms: Platform[];
  availableElements: ElementType[];
}

type GameAction = 
  | { type: 'START_GAME' }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' }
  | { type: 'END_GAME' }
  | { type: 'RESTART_GAME' }
  | { type: 'GAME_OVER' }
  | { type: 'PLAYER_MOVE', payload: { x: number, y: number } }
  | { type: 'PLAYER_MOVE_WITH_VELOCITY', payload: { x: number, y: number, velocityY: number } }
  | { type: 'UPDATE_VELOCITY_Y', payload: number }
  | { type: 'PLAYER_MOVE_LEFT', payload: boolean }
  | { type: 'PLAYER_MOVE_RIGHT', payload: boolean }
  | { type: 'PLAYER_DUCK', payload: boolean }
  | { type: 'PLAYER_JUMP' }
  | { type: 'PLAYER_LAND', payload: { platformY: number } }
  | { type: 'CHANGE_ELEMENT', payload: ElementType }
  | { type: 'UPDATE_HEALTH', payload: number }
  | { type: 'UPDATE_ENERGY', payload: number }
  | { type: 'UPDATE_SCORE', payload: number }
  | { type: 'SET_PLATFORMS', payload: Platform[] }
  | { type: 'SET_ON_PLATFORM', payload: boolean };

// Initial state
const initialPlayerState: PlayerState = {
  x: 100,
  y: 300,
  velocityX: 0,
  velocityY: 0,
  width: 40,
  height: 50,
  isJumping: false,
  isDucking: false,
  isMovingLeft: false,
  isMovingRight: false,
  currentElement: 'spirit',
  health: 100,
  maxHealth: 100,
  energy: 100,
  maxEnergy: 100,
  onPlatform: false,
};

// Initial platforms
const initialPlatforms: Platform[] = [
  // Ground platform - can't pass through
  { x: 0, y: 350, width: 1600, height: 20, element: 'spirit', canPassThrough: false },
  
  // Floating platforms - can pass through from below
  { x: 200, y: 250, width: 100, height: 15, element: 'fire', canPassThrough: true },
  { x: 400, y: 200, width: 120, height: 15, element: 'water', canPassThrough: true },
  { x: 600, y: 250, width: 80, height: 15, element: 'earth', canPassThrough: true },
  { x: 800, y: 180, width: 100, height: 15, element: 'air', canPassThrough: true },
];

const initialGameState: GameState = {
  isPlaying: false,
  isPaused: false,
  gameOver: false,
  score: 0,
  level: 1,
  player: initialPlayerState,
  platforms: initialPlatforms,
  availableElements: ['spirit', 'fire', 'water', 'earth', 'air'],
};

// Game reducer
const gameReducer = (state: GameState, action: GameAction): GameState => {
  console.log("Game reducer:", action.type, action); // Debug log
  
  switch (action.type) {
    case 'START_GAME':
      console.log("Starting game, setting isPlaying to true");
      return { 
        ...initialGameState, 
        isPlaying: true, 
        player: {
          ...initialPlayerState,
          onPlatform: true // Start on platform to avoid initial falling
        }
      };
    case 'PAUSE_GAME':
      return { ...state, isPaused: true };
    case 'RESUME_GAME':
      return { ...state, isPaused: false };
    case 'END_GAME':
      return { ...initialGameState };
    case 'RESTART_GAME':
      return { 
        ...initialGameState, 
        isPlaying: true,
        score: 0, 
        level: 1,
        player: {
          ...initialPlayerState,
          onPlatform: true // Start on platform to avoid initial falling
        }
      };
    case 'GAME_OVER':
      return { ...state, gameOver: true };
    case 'PLAYER_MOVE':
      return {
        ...state,
        player: {
          ...state.player,
          x: action.payload.x,
          y: action.payload.y,
        },
      };
    case 'PLAYER_MOVE_WITH_VELOCITY':
      return {
        ...state,
        player: {
          ...state.player,
          x: action.payload.x,
          y: action.payload.y,
          velocityY: action.payload.velocityY,
        },
      };
    case 'UPDATE_VELOCITY_Y':
      return {
        ...state,
        player: {
          ...state.player,
          velocityY: action.payload,
        },
      };
    case 'PLAYER_MOVE_LEFT':
      const moveSpeed = state.player.isDucking ? 2 : 5; // Slower when ducking
      return {
        ...state,
        player: {
          ...state.player,
          isMovingLeft: action.payload,
          velocityX: action.payload ? -moveSpeed : state.player.isMovingRight ? moveSpeed : 0,
        },
      };
    case 'PLAYER_MOVE_RIGHT':
      const moveSpeedRight = state.player.isDucking ? 2 : 5; // Slower when ducking
      return {
        ...state,
        player: {
          ...state.player,
          isMovingRight: action.payload,
          velocityX: action.payload ? moveSpeedRight : state.player.isMovingLeft ? -moveSpeedRight : 0,
        },
      };
    case 'PLAYER_DUCK':
      // Adjust height when ducking
      return {
        ...state,
        player: {
          ...state.player,
          isDucking: action.payload,
          height: action.payload ? 30 : 50, // Shorter when ducking
          // Slow down when ducking
          velocityX: action.payload 
            ? (state.player.velocityX > 0 ? 2 : (state.player.velocityX < 0 ? -2 : 0)) 
            : (state.player.isMovingRight ? 5 : (state.player.isMovingLeft ? -5 : 0)),
        },
      };
    case 'PLAYER_JUMP':
      // Only jump if we're not already jumping
      if (state.player.isJumping || !state.player.onPlatform) return state;
      
      // Different jump heights for different elements
      let jumpVelocity = -15; // Default jump velocity
      
      // Element-specific jump velocities
      switch (state.player.currentElement) {
        case 'air':
          jumpVelocity = -17; // Air jumps higher
          break;
        case 'earth':
          jumpVelocity = -18; // Earth jumps highest but falls fastest
          break;
        case 'fire':
          jumpVelocity = -16; // Fire jumps a bit higher
          break;
        case 'water':
          jumpVelocity = -14; // Water jumps less high but floats
          break;
        default:
          jumpVelocity = -15; // Spirit form is balanced
      }
      
      return {
        ...state,
        player: {
          ...state.player,
          isJumping: true,
          onPlatform: false,
          velocityY: jumpVelocity,
        },
      };
    case 'PLAYER_LAND':
      // Earth element creates a small "shock" when landing from a high jump
      const landingY = action.payload.platformY - state.player.height;
      
      return {
        ...state,
        player: {
          ...state.player,
          isJumping: false,
          velocityY: 0,
          y: landingY, // Set to platform top minus player height
          onPlatform: true,
        },
      };
    case 'SET_ON_PLATFORM':
      return {
        ...state,
        player: {
          ...state.player,
          onPlatform: action.payload,
        },
      };
    case 'CHANGE_ELEMENT':
      // Add some score for changing elements (encourages experimentation)
      let scoreBonus = state.player.currentElement !== action.payload ? 5 : 0;
      
      return {
        ...state,
        score: state.score + scoreBonus,
        player: {
          ...state.player,
          currentElement: action.payload,
          // Health/energy adjustments for different elements
          health: state.player.health, // Keep health the same
          energy: state.player.energy, // Keep energy the same
        },
      };
    case 'SET_PLATFORMS':
      return {
        ...state,
        platforms: action.payload,
      };
    case 'UPDATE_HEALTH':
      return {
        ...state,
        player: {
          ...state.player,
          health: Math.max(0, Math.min(state.player.maxHealth, action.payload)),
        },
        // If health reaches 0, trigger game over
        gameOver: action.payload <= 0,
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
  
  // Debug state changes
  useEffect(() => {
    console.log("Game state updated:", state);
  }, [state]);
  
  const elementColors: Record<ElementType, string> = {
    spirit: '#2A2A2A',
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
        case 'W':
          dispatch({ type: 'PLAYER_JUMP' });
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          dispatch({ type: 'PLAYER_MOVE_LEFT', payload: true });
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          dispatch({ type: 'PLAYER_MOVE_RIGHT', payload: true });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          dispatch({ type: 'PLAYER_DUCK', payload: true });
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
    
    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          dispatch({ type: 'PLAYER_MOVE_LEFT', payload: false });
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          dispatch({ type: 'PLAYER_MOVE_RIGHT', payload: false });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          dispatch({ type: 'PLAYER_DUCK', payload: false });
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [state.isPlaying, state.isPaused]);
  
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