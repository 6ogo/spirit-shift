
import React, { useEffect, useRef, useState } from 'react';
import { useGame, Platform } from '@/contexts/GameContext';
import { motion } from 'framer-motion';

export interface GameLoopProps {
  fps?: number;
}

// Transition overlay component for level transitions
export const LevelTransition = () => {
  const { state } = useGame();
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  useEffect(() => {
    if (state.level === 2 && state.isPlaying) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state.level, state.isPlaying]);
  
  if (!isTransitioning) return null;
  
  return (
    <motion.div 
      className="fixed inset-0 bg-black z-50 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.75 }}
    />
  );
};

export const useGameLoop = ({ fps = 60 }: GameLoopProps = {}) => {
  const { state, dispatch } = useGame();
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const fpsInterval = 1000 / fps;

  // Store performance metrics
  const metricsRef = useRef({
    lastFpsUpdate: 0,
    frameCount: 0,
    currentFps: 0
  });

  // Store the last position to detect movement issues
  const lastPositionRef = useRef({ x: 0, y: 0 });
  const movementDebugRef = useRef({ lastLogTime: 0 });

  const gameLoop = (time: number) => {
    if (previousTimeRef.current === undefined) {
      previousTimeRef.current = time;
      metricsRef.current.lastFpsUpdate = time;
    }

    const elapsed = time - previousTimeRef.current;

    // Calculate FPS for optimization
    metricsRef.current.frameCount++;
    if (time - metricsRef.current.lastFpsUpdate >= 1000) {
      metricsRef.current.currentFps = metricsRef.current.frameCount;
      metricsRef.current.frameCount = 0;
      metricsRef.current.lastFpsUpdate = time;
    }

    if (elapsed > fpsInterval) {
      // Only update the game state if we're playing and not paused
      if (state.isPlaying && !state.isPaused && !state.gameOver) {
        updateGameState(elapsed / 1000); // Convert to seconds for easier physics
      }

      previousTimeRef.current = time - (elapsed % fpsInterval);
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  };

  // Check if the player is colliding with a platform
  const checkPlatformCollision = (playerX: number, playerY: number, playerWidth: number, playerHeight: number, platform: Platform) => {
    const playerBottom = playerY;
    const playerTop = playerY - playerHeight;
    const playerLeft = playerX - playerWidth / 2;
    const playerRight = playerX + playerWidth / 2;

    const platformTop = platform.y;
    const platformBottom = platform.y + platform.height;
    const platformLeft = platform.x;
    const platformRight = platform.x + platform.width;

    // Check if there's an overlap on both axes
    return (
      playerRight > platformLeft &&
      playerLeft < platformRight &&
      playerBottom >= platformTop &&
      playerTop <= platformBottom
    );
  }

  // Check if player is standing on a platform (only colliding with the top)
  const checkStandingOnPlatform = (playerX: number, playerY: number, playerWidth: number, playerHeight: number, platform: Platform, velocityY: number) => {
    const playerBottom = playerY;
    const playerLeft = playerX - playerWidth / 2;
    const playerRight = playerX + playerWidth / 2;

    const platformTop = platform.y;
    const platformLeft = platform.x;
    const platformRight = platform.x + platform.width;

    // Only consider landing if:
    // 1. Player is moving downward (or zero for initial placement)
    // 2. Player bottom is at or slightly below platform top
    // 3. Player is horizontally within platform bounds
    const isLanding = velocityY >= 0 &&
      playerBottom >= platformTop &&
      playerBottom <= platformTop + 10 && // Tolerance zone
      playerRight > platformLeft &&
      playerLeft < platformRight;

    return isLanding;
  }

  // Check if player is hitting the bottom of a platform
  const checkHittingPlatformBottom = (playerX: number, playerY: number, playerWidth: number, playerHeight: number, platform: Platform, velocityY: number) => {
    // Only check pass-through platforms
    if (!platform.canPassThrough) return false;

    const playerTop = playerY - playerHeight;
    const playerLeft = playerX - playerWidth / 2;
    const playerRight = playerX + playerWidth / 2;

    const platformBottom = platform.y + platform.height;
    const platformLeft = platform.x;
    const platformRight = platform.x + platform.width;

    // Only consider hitting if:
    // 1. Player is moving upward
    // 2. Player top is at or slightly above platform bottom
    // 3. Player is horizontally within platform bounds
    return velocityY < 0 &&
      playerTop <= platformBottom &&
      playerTop >= platformBottom - 10 && // Tolerance zone 
      playerRight > platformLeft &&
      playerLeft < platformRight;
  }

  const updateGameState = (deltaTime: number) => {
    // Cap delta time to prevent huge jumps on tab switch or slow devices
    const cappedDelta = Math.min(deltaTime, 0.1);
    
    // Gravity effect - adjusted for deltaTime
    const gravity = 0.98 * 60 * cappedDelta;

    // Update player position directly from state
    let playerX = state.player.x;
    let playerY = state.player.y;
    let velocityX = state.player.velocityX;
    let velocityY = state.player.velocityY;
    let playerWidth = state.player.width;
    let playerHeight = state.player.height;

    // FIXED: Apply movement with proper velocity calculation
    let baseSpeed = state.player.isDucking ? 3 : 5;
    
    // Apply element-specific speed modifiers
    switch (state.player.currentElement) {
      case 'air':
        baseSpeed *= 1.3; // Air is faster
        break;
      case 'earth':
        baseSpeed *= 0.85; // Earth is slower
        break;
      default:
        // Other elements use default speed
        break;
    }
    
    // CRITICAL FIX: directly calculate velocityX based on movement flags
    if (state.player.isMovingLeft && !state.player.isMovingRight) {
      velocityX = -baseSpeed;
    } else if (state.player.isMovingRight && !state.player.isMovingLeft) {
      velocityX = baseSpeed;
    } else {
      velocityX = 0;
    }

    // Apply horizontal movement with proper scaling to deltaTime
    const moveStep = velocityX * 60 * cappedDelta;
    playerX += moveStep;
    
    // Regularly log movement debugging info
    const now = Date.now();
    if (now - movementDebugRef.current.lastLogTime > 500) {
      console.log(`MOVEMENT DEBUG: x=${playerX.toFixed(1)}, vel=${velocityX.toFixed(1)}, step=${moveStep.toFixed(2)}, isMovingLeft=${state.player.isMovingLeft}, isMovingRight=${state.player.isMovingRight}`);
      movementDebugRef.current.lastLogTime = now;
    }
    
    // Ensure player doesn't go off-screen horizontally
    playerX = Math.max(playerWidth / 2, Math.min(1600 - playerWidth / 2, playerX));

    // Check if player has moved far enough right to start Level 1
    if (state.isTutorialLevel && playerX > 600) {
      dispatch({ type: 'ADVANCE_LEVEL' });
    }

    // Apply gravity if the player is jumping or not on a platform
    if (state.player.isJumping || !state.player.onPlatform) {
      velocityY += gravity;
      playerY += velocityY * cappedDelta * 60;

      // Check if player landed on any platform
      let landed = false;
      let platformLandedOn = null;

      for (const platform of state.platforms) {
        // Handle landing on platform
        if (checkStandingOnPlatform(playerX, playerY, playerWidth, playerHeight, platform, velocityY)) {
          // Only land if it's a ground platform or we're falling onto it
          if (!platform.canPassThrough || velocityY > 0) {
            playerY = platform.y;
            velocityY = 0;
            landed = true;
            platformLandedOn = platform;
            break;
          }
        }
        
        // Player hitting the bottom of a pass-through platform
        else if (checkHittingPlatformBottom(playerX, playerY, playerWidth, playerHeight, platform, velocityY)) {
          velocityY = Math.abs(velocityY * 0.5); // Bounce slightly
        }
      }

      if (landed) {
        dispatch({ 
          type: 'PLAYER_LAND', 
          payload: { platformY: platformLandedOn ? platformLandedOn.y : playerY + playerHeight } 
        });
      } else {
        dispatch({ type: 'SET_ON_PLATFORM', payload: false });
      }
    }

    // Clamp player position to ensure they don't fall out of the world
    playerY = Math.min(800, playerY);
    
    if (playerY >= 800) {
      velocityY = 0;
      playerY = 800;
      dispatch({ type: 'SET_ON_PLATFORM', payload: true });
    }

    // CRITICAL FIX: Update the player position and velocity in a single dispatch
    // This ensures the game state and rendering stay in sync
    dispatch({
      type: 'PLAYER_MOVE_WITH_VELOCITY',
      payload: {
        x: playerX,
        y: playerY,
        velocityX: velocityX,
        velocityY: velocityY
      }
    });

    // Update projectiles
    dispatch({ type: 'UPDATE_PROJECTILES' });

    // Energy regeneration based on element
    let energyRegen = 0.05;
    switch (state.player.currentElement) {
      case 'fire':
        energyRegen = 0.1;
        break;
      case 'water':
        energyRegen = 0.075;
        break;
      case 'earth':
        energyRegen = 0.05;
        break;
      case 'air':
        energyRegen = 0.08;
        break;
      default:
        energyRegen = 0.07;
    }

    const newEnergy = Math.min(state.player.maxEnergy, state.player.energy + energyRegen);

    // Update player energy (but not position/velocity - those are already updated)
    dispatch({
      type: 'UPDATE_PLAYER',
      payload: {
        energy: newEnergy
      }
    });

    // Debug logging for movement issues
    if (Math.abs(lastPositionRef.current.x - playerX) > 0.1) {
      lastPositionRef.current = { x: playerX, y: playerY };
    }
  };

  // Set up and clean up game loop with requestAnimationFrame
  useEffect(() => {
    if (state.isPlaying && !state.isPaused) {
      // Clean up any existing animation frame
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      
      // Start a new game loop
      requestRef.current = requestAnimationFrame(gameLoop);
      console.log("Game loop started");
    } else if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      console.log("Game loop stopped");
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        console.log("Game loop cleanup");
      }
    };
  }, [state.isPlaying, state.isPaused, state.gameOver]);

  return { state };
};
