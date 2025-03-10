
import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Types
export type ElementType = 'spirit' | 'fire' | 'water' | 'earth' | 'air';

export interface Enemy {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  element: ElementType;
  direction: 'left' | 'right';
  speed: number;
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  element: ElementType;
  canPassThrough: boolean;
}

export interface ProjectileState {
  id: number;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  element: ElementType;
  damage: number;
  width: number;
  height: number;
  active: boolean;
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
  isShooting: boolean;
  lastShootTime: number;
  shootCooldown: number;
  currentElement: ElementType;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  onPlatform: boolean;
  aimDirectionX: number;
  aimDirectionY: number;
  facingDirection: 'left' | 'right';
}

export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  gameOver: boolean;
  score: number;
  level: number;
  player: PlayerState;
  platforms: Platform[];
  enemies: Enemy[];
  projectiles: ProjectileState[];
  availableElements: ElementType[];
  nextProjectileId: number;
  levelProgress: number;
  worldSeed: number;
  isTutorialLevel: boolean; // Added to track if we're on the tutorial level
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
  | { type: 'PLAYER_SHOOT' }
  | { type: 'UPDATE_AIM_DIRECTION', payload: { x: number, y: number } }
  | { type: 'CHANGE_ELEMENT', payload: ElementType }
  | { type: 'UPDATE_HEALTH', payload: number }
  | { type: 'UPDATE_ENERGY', payload: number }
  | { type: 'UPDATE_SCORE', payload: number }
  | { type: 'UPDATE_ENEMIES', payload }
  | { type: 'SET_PLATFORMS', payload: Platform[] }
  | { type: 'SET_ON_PLATFORM', payload: boolean }
  | { type: 'ADVANCE_LEVEL' }
  | { type: 'GENERATE_LEVEL' }
  | { type: 'ADD_ENEMY', payload: Enemy }
  | { type: 'UPDATE_ENEMY', payload: Enemy }  // Added for updating individual enemies
  | { type: 'DAMAGE_ENEMY', payload: { id: number, damage: number } }
  | { type: 'REMOVE_ENEMY', payload: number };

// Initial state
const initialPlayerState: PlayerState = {
  x: 100,
  y: 450, // Moved down to spawn at the bottom
  velocityX: 0,
  velocityY: 0,
  width: 40,
  height: 50,
  isJumping: false,
  isDucking: false,
  isMovingLeft: false,
  isMovingRight: false,
  isShooting: false,
  lastShootTime: 0,
  shootCooldown: 500,
  currentElement: 'spirit',
  health: 100,
  maxHealth: 100,
  energy: 100,
  maxEnergy: 100,
  onPlatform: false,
  aimDirectionX: 1,
  aimDirectionY: 0,
  facingDirection: 'right',
};

// Helper function to generate tutorial level with only floor platform (no enemies)
const generateTutorialLevel = (): Platform[] => {
  return [
    { x: 0, y: 500, width: 2000, height: 30, element: 'spirit', canPassThrough: false },
  ];
};

// Helper function to generate random platforms
const generatePlatforms = (level: number, seed: number): Platform[] => {
  const rng = (min: number, max: number) => {
    seed = (seed * 9301 + 49297) % 233280;
    const random = seed / 233280;
    return min + random * (max - min);
  };

  const platforms: Platform[] = [
    { x: 0, y: 500, width: 2000, height: 30, element: 'spirit', canPassThrough: false },
  ];

  // Skip adding other platforms for tutorial level
  if (level === 1) {
    return platforms;
  }

  platforms.push({
    x: 50,
    y: 350,
    width: 200,
    height: 15,
    element: 'spirit',
    canPassThrough: true
  });

  const elements: ElementType[] = ['fire', 'water', 'earth', 'air'];

  const platformCount = 5 + Math.min(level * 3, 20);

  const minY = 150;
  const maxY = 450;
  const levelWidth = 1000 + level * 200;

  for (let i = 0; i < platformCount; i++) {
    const segmentWidth = levelWidth / platformCount;
    const segmentStart = segmentWidth * i;
    const xPos = segmentStart + rng(20, segmentWidth - 100);

    const yPos = rng(minY, maxY);

    const width = rng(80, 200);

    const elementIndex = Math.floor(rng(0, elements.length));
    const element = elements[elementIndex];

    const passThrough = rng(0, 10) < (7 + level * 0.5);

    const overlaps = platforms.some(p => {
      return (
        xPos < p.x + p.width &&
        xPos + width > p.x &&
        Math.abs(yPos - p.y) < 30
      );
    });

    if (!overlaps) {
      platforms.push({
        x: xPos,
        y: yPos,
        width,
        height: 15,
        element,
        canPassThrough: passThrough
      });
    } else {
      i--;
    }
  }

  return platforms;
};

// Helper function to generate enemies based on level
const generateEnemies = (level: number, platforms: Platform[], seed: number): Enemy[] => {
  // No enemies in tutorial level
  if (level === 1) {
    return [];
  }
  
  const enemies: Enemy[] = [];

  const rng = (min: number, max: number) => {
    seed = (seed * 9301 + 49297) % 233280;
    const random = seed / 233280;
    return min + random * (max - min);
  };

  const enemyCount = Math.min(level * 2, 15);

  const elements: ElementType[] = ['fire', 'water', 'earth', 'air'];

  const availablePlatforms = platforms.slice(2);

  for (let i = 0; i < enemyCount; i++) {
    if (availablePlatforms.length === 0) break;

    const platformIndex = Math.floor(rng(0, availablePlatforms.length));
    const platform = availablePlatforms[platformIndex];

    const xPos = platform.x + rng(20, platform.width - 40);
    const yPos = platform.y - 30;

    const elementIndex = Math.floor(rng(0, elements.length));
    const element = elements[elementIndex];

    const speed = 0.5 + rng(0, level * 0.2);

    enemies.push({
      id: i,
      x: xPos,
      y: yPos,
      width: 30,
      height: 30,
      health: 30 + level * 5,
      maxHealth: 30 + level * 5,
      element: element,
      direction: rng(0, 1) > 0.5 ? 'left' : 'right',
      speed: speed
    });

    availablePlatforms.splice(platformIndex, 1);
  }

  return enemies;
};

const tutorialPlatforms = generateTutorialLevel();

const initialGameState: GameState = {
  isPlaying: false,
  isPaused: false,
  gameOver: false,
  score: 0,
  level: 1,
  player: initialPlayerState,
  platforms: tutorialPlatforms,
  enemies: [],
  projectiles: [],
  availableElements: ['spirit', 'fire', 'water', 'earth', 'air'],
  nextProjectileId: 1,
  levelProgress: 0,
  worldSeed: Date.now(),
  isTutorialLevel: true,
};

// Game reducer
const gameReducer = (state: GameState, action: GameAction): GameState => {
  console.log("Game reducer:", action.type, action);

  switch (action.type) {
    case 'START_GAME': {
      const newSeed = Date.now();
      
      return {
        ...initialGameState,
        isPlaying: true,
        platforms: tutorialPlatforms,
        enemies: [],
        worldSeed: newSeed,
        isTutorialLevel: true,
        player: {
          ...initialPlayerState,
          x: 100,
          y: 450,
          onPlatform: true
        }
      };
    }
    case 'PAUSE_GAME':
      return { ...state, isPaused: true };
    case 'RESUME_GAME':
      return { ...state, isPaused: false };
    case 'END_GAME':
      return { ...initialGameState };
    case 'RESTART_GAME': {
      const newSeed = Date.now();
      
      return {
        ...initialGameState,
        isPlaying: true,
        score: 0,
        level: 1,
        platforms: tutorialPlatforms,
        enemies: [],
        worldSeed: newSeed,
        isTutorialLevel: true,
        player: {
          ...initialPlayerState,
          x: 100,
          y: 450,
          onPlatform: true
        }
      };
    }
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
    case 'PLAYER_MOVE_LEFT': {
      console.log(`PLAYER_MOVE_LEFT: ${action.payload}`);
      const moveSpeed = state.player.isDucking ? 3 : 5;
      return {
        ...state,
        player: {
          ...state.player,
          isMovingLeft: action.payload,
          velocityX: action.payload ? -moveSpeed : state.player.isMovingRight ? moveSpeed : 0,
          facingDirection: action.payload ? 'left' : state.player.facingDirection,
        },
      };
    }
    case 'PLAYER_MOVE_RIGHT': {
      console.log(`PLAYER_MOVE_RIGHT: ${action.payload}`);
      const moveSpeedRight = state.player.isDucking ? 3 : 5;
      return {
        ...state,
        player: {
          ...state.player,
          isMovingRight: action.payload,
          velocityX: action.payload ? moveSpeedRight : state.player.isMovingLeft ? -moveSpeedRight : 0,
          facingDirection: action.payload ? 'right' : state.player.facingDirection,
        },
      };
    }
    case 'PLAYER_DUCK': {
      console.log(`PLAYER_DUCK: ${action.payload}`);
      return {
        ...state,
        player: {
          ...state.player,
          isDucking: action.payload,
          height: action.payload ? 30 : 50,
          velocityX: action.payload
            ? (state.player.velocityX > 0 ? 2 : (state.player.velocityX < 0 ? -2 : 0))
            : (state.player.isMovingRight ? 5 : (state.player.isMovingLeft ? -5 : 0)),
        },
      };
    }
    case 'PLAYER_JUMP': {
      console.log(`PLAYER_JUMP attempt - onPlatform: ${state.player.onPlatform}, isJumping: ${state.player.isJumping}`);
      if (state.player.isJumping || !state.player.onPlatform) {
        console.log("Jump rejected - already jumping or not on platform");
        return state;
      }

      let jumpVelocity = -15;
      switch (state.player.currentElement) {
        case 'air':
          jumpVelocity = -17;
          break;
        case 'earth':
          jumpVelocity = -18;
          break;
        case 'fire':
          jumpVelocity = -16;
          break;
        case 'water':
          jumpVelocity = -14;
          break;
        default:
          jumpVelocity = -15;
      }
      console.log(`Jump accepted with velocity: ${jumpVelocity}`);
      return {
        ...state,
        player: {
          ...state.player,
          isJumping: true,
          onPlatform: false,
          velocityY: jumpVelocity,
        },
      };
    }
    case 'PLAYER_LAND': {
      const landingY = action.payload.platformY - state.player.height;
      return {
        ...state,
        player: {
          ...state.player,
          isJumping: false,
          velocityY: 0,
          y: landingY,
          onPlatform: true,
        },
      };
    }
    case 'SET_ON_PLATFORM':
      return {
        ...state,
        player: {
          ...state.player,
          onPlatform: action.payload,
        },
      };
    case 'UPDATE_AIM_DIRECTION': {
      // Fix the aim direction to use the correct facing direction
      return {
        ...state,
        player: {
          ...state.player,
          aimDirectionX: action.payload.x,
          aimDirectionY: action.payload.y,
          facingDirection: action.payload.x >= 0 ? 'right' : 'left'
        }
      };
    }
    case 'PLAYER_SHOOT': {
      const now = Date.now();
      if (now - state.player.lastShootTime < state.player.shootCooldown) {
        return state;
      }
      if (state.player.energy < 10) {
        return state;
      }

      const projectileSpeed = 12;
      let projectileWidth = 10;
      let projectileHeight = 10;
      let projectileDamage = 10;

      switch (state.player.currentElement) {
        case 'fire':
          projectileDamage = 15;
          projectileWidth = 12;
          projectileHeight = 12;
          break;
        case 'water':
          projectileDamage = 8;
          projectileWidth = 8;
          projectileHeight = 8;
          break;
        case 'earth':
          projectileDamage = 20;
          projectileWidth = 15;
          projectileHeight = 15;
          break;
        case 'air':
          projectileDamage = 5;
          projectileWidth = 6;
          projectileHeight = 6;
          break;
      }

      // Calculate proper aim direction for projectiles
      const aimLength = Math.sqrt(
        state.player.aimDirectionX * state.player.aimDirectionX +
        state.player.aimDirectionY * state.player.aimDirectionY
      );

      // If aim length is too small, default to shooting in the direction the player is facing
      let normalizedX = 0;
      let normalizedY = 0;
      
      if (aimLength > 0.1) {
        normalizedX = state.player.aimDirectionX / aimLength;
        normalizedY = state.player.aimDirectionY / aimLength;
      } else {
        normalizedX = state.player.facingDirection === 'right' ? 1 : -1;
        normalizedY = 0;
      }

      console.log("Shooting projectile with direction:", { 
        aimX: state.player.aimDirectionX, 
        aimY: state.player.aimDirectionY,
        normalizedX, 
        normalizedY
      });

      const newProjectile: ProjectileState = {
        id: state.nextProjectileId,
        x: state.player.x + (normalizedX * state.player.width / 2),
        y: state.player.y - state.player.height / 2, // Adjust to shoot from center of player
        velocityX: normalizedX * projectileSpeed,
        velocityY: normalizedY * projectileSpeed,
        element: state.player.currentElement,
        damage: projectileDamage,
        width: projectileWidth,
        height: projectileHeight,
        active: true
      };

      return {
        ...state,
        player: {
          ...state.player,
          lastShootTime: now,
          energy: state.player.energy - 10,
        },
        projectiles: [...state.projectiles, newProjectile],
        nextProjectileId: state.nextProjectileId + 1
      };
    }
    case 'UPDATE_PROJECTILES': {
      const updatedProjectiles = state.projectiles
        .map(projectile => {
          if (!projectile.active) return projectile;

          const newX = projectile.x + projectile.velocityX;
          const newY = projectile.y + projectile.velocityY;

          if (newX < 0 || newX > 2000 || newY < 0 || newY > 800) {
            return { ...projectile, active: false };
          }

          let hasCollided = false;
          const updatedEnemies = [...state.enemies];

          for (let i = 0; i < updatedEnemies.length; i++) {
            const enemy = updatedEnemies[i];

            if (
              newX + projectile.width / 2 > enemy.x - enemy.width / 2 &&
              newX - projectile.width / 2 < enemy.x + enemy.width / 2 &&
              newY + projectile.height / 2 > enemy.y - enemy.height &&
              newY - projectile.height / 2 < enemy.y
            ) {
              let damageMultiplier = 1;

              if (
                (projectile.element === 'fire' && enemy.element === 'air') ||
                (projectile.element === 'water' && enemy.element === 'fire') ||
                (projectile.element === 'earth' && enemy.element === 'water') ||
                (projectile.element === 'air' && enemy.element === 'earth')
              ) {
                damageMultiplier = 2;
              } else if (
                (projectile.element === 'air' && enemy.element === 'fire') ||
                (projectile.element === 'fire' && enemy.element === 'water') ||
                (projectile.element === 'water' && enemy.element === 'earth') ||
                (projectile.element === 'earth' && enemy.element === 'air')
              ) {
                damageMultiplier = 0.5;
              } else if (projectile.element === enemy.element) {
                damageMultiplier = 0.25;
              }

              const damage = projectile.damage * damageMultiplier;
              updatedEnemies[i] = {
                ...enemy,
                health: Math.max(0, enemy.health - damage)
              };

              hasCollided = true;
              break;
            }
          }

          for (const platform of state.platforms) {
            if (!platform.canPassThrough) {
              if (
                newX + projectile.width / 2 > platform.x &&
                newX - projectile.width / 2 < platform.x + platform.width &&
                newY + projectile.height / 2 > platform.y &&
                newY - projectile.height / 2 < platform.y + platform.height
              ) {
                hasCollided = true;
                break;
              }
            }
          }

          return {
            ...projectile,
            x: newX,
            y: newY,
            active: !hasCollided
          };
        })
        .filter(projectile => projectile.active);

      const remainingEnemies = state.enemies.filter(enemy => enemy.health > 0);
      const defeatedCount = state.enemies.length - remainingEnemies.length;

      const scoreIncrease = defeatedCount * 10;

      return {
        ...state,
        projectiles: updatedProjectiles,
        enemies: remainingEnemies,
        score: state.score + scoreIncrease
      };
    }
    case 'REMOVE_PROJECTILE':
      return {
        ...state,
        projectiles: state.projectiles.filter(p => p.id !== action.payload)
      };
    case 'CHANGE_ELEMENT': {
      // Don't add score when changing elements
      return {
        ...state,
        player: {
          ...state.player,
          currentElement: action.payload,
        },
      };
    }
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
        gameOver: action.payload <= 0,
      };
    case 'UPDATE_ENEMIES': {
      return {
        ...state,
        enemies: action.payload
      };
    }
    case 'UPDATE_ENEMY': {
      // Fixed: Now properly types the enemy.direction as 'left' | 'right'
      const updatedEnemies = state.enemies.map(enemy => 
        enemy.id === action.payload.id ? action.payload : enemy
      );
      
      return {
        ...state,
        enemies: updatedEnemies
      };
    }
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
    case 'ADVANCE_LEVEL': {
      const newLevel = state.level + 1;
      const newPlatforms = generatePlatforms(newLevel, state.worldSeed + newLevel);
      const newEnemies = generateEnemies(newLevel, newPlatforms, state.worldSeed + newLevel);

      return {
        ...state,
        level: newLevel,
        platforms: newPlatforms,
        enemies: newEnemies,
        player: {
          ...state.player,
          x: 100,
          y: 300,
          velocityX: 0,
          velocityY: 0,
          onPlatform: true,
          health: Math.min(state.player.maxHealth, state.player.health + 20),
          energy: Math.min(state.player.maxEnergy, state.player.energy + 50),
        },
        projectiles: [],
        levelProgress: 0,
        isTutorialLevel: false,
      };
    }
    case 'GENERATE_LEVEL': {
      const newPlatforms = generatePlatforms(state.level, state.worldSeed + state.level);
      const newEnemies = generateEnemies(state.level, newPlatforms, state.worldSeed + state.level);

      return {
        ...state,
        platforms: newPlatforms,
        enemies: newEnemies,
      };
    }
    case 'ADD_ENEMY':
      return {
        ...state,
        enemies: [...state.enemies, action.payload],
      };
    case 'DAMAGE_ENEMY': {
      const updatedEnemies = state.enemies.map(enemy =>
        enemy.id === action.payload.id
          ? { ...enemy, health: Math.max(0, enemy.health - action.payload.damage) }
          : enemy
      );

      const previousCount = state.enemies.length;
      const remainingEnemies = updatedEnemies.filter(enemy => enemy.health > 0);
      const defeatedCount = previousCount - remainingEnemies.length;

      const scoreIncrease = defeatedCount * 10;

      return {
        ...state,
        enemies: remainingEnemies,
        score: state.score + scoreIncrease
      };
    }
    case 'REMOVE_ENEMY':
      return {
        ...state,
        enemies: state.enemies.filter(enemy => enemy.id !== action.payload),
      };
    default:
      return state;
  }
};

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  elementColors: Record<ElementType, string>;
  elementNames: Record<ElementType, string>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  useEffect(() => {
    // console.log("Game state updated:", state);
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
        case 'f':
        case 'F':
          dispatch({ type: 'PLAYER_SHOOT' });
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

    // Using document for keyboard events for better reliability
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [state.isPlaying, state.isPaused]);

  useEffect(() => {
    if (!state.isPlaying || state.isPaused || state.gameOver) return;

    const projectileInterval = setInterval(() => {
      if (state.projectiles.length > 0) {
        dispatch({ type: 'UPDATE_PROJECTILES' });
      }
    }, 50);

    return () => clearInterval(projectileInterval);
  }, [state.isPlaying, state.isPaused, state.gameOver, state.projectiles.length]);

  useEffect(() => {
    if (!state.isPlaying || state.isPaused || state.gameOver) return;

    // If player moves far enough to the right and it's the tutorial level
    if (state.isTutorialLevel && state.player.x > 800) {
      dispatch({ type: 'ADVANCE_LEVEL' });
    } 
    // For other levels
    else if (!state.isTutorialLevel && state.player.x > 1500) {
      dispatch({ type: 'ADVANCE_LEVEL' });
    }
  }, [state.isPlaying, state.isPaused, state.gameOver, state.player.x, state.isTutorialLevel]);

  return (
    <GameContext.Provider value={{ state, dispatch, elementColors, elementNames }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
