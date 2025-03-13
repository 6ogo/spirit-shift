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
    // Detect level changes
    if (state.level === 2 && state.isPlaying) {
      setIsTransitioning(true);
      // Reset after animation completes
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 1500); // Match this with the animation duration
      
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
    const gravity = 0.8 * 60 * cappedDelta;

    // Update player position
    let playerX = state.player.x;
    let playerY = state.player.y;
    let velocityX = state.player.velocityX;
    let velocityY = state.player.velocityY;
    let playerWidth = state.player.width;
    let playerHeight = state.player.height;

    // Apply movement based on player's movement flags - FIXED: Ensure velocity is applied correctly
    if (state.player.isMovingLeft) {
      velocityX = state.player.isDucking ? -3 : -5;
    } else if (state.player.isMovingRight) {
      velocityX = state.player.isDucking ? 3 : 5;
    } else {
      velocityX = 0; // Stop when not moving
    }

    // Apply horizontal movement - properly scaled by delta time
    const moveStep = velocityX * 60 * cappedDelta;
    playerX += moveStep;
    
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
            landed = true;
            platformLandedOn = platform;
            break;
          }
        }

        // Check if hitting bottom of platform when jumping
        if (checkHittingPlatformBottom(playerX, playerY, playerWidth, playerHeight, platform, velocityY)) {
          // Bounce off the bottom slightly
          velocityY = Math.abs(velocityY) * 0.3;
          
          // Update velocity immediately
          dispatch({
            type: 'UPDATE_VELOCITY_Y',
            payload: velocityY
          });
        }
      }

      if (landed && platformLandedOn) {
        // Player has landed on a platform
        dispatch({
          type: 'PLAYER_LAND',
          payload: { platformY: platformLandedOn.y }
        });
      } else {
        // Update player position with velocity - Key for smooth movement
        dispatch({
          type: 'PLAYER_MOVE_WITH_VELOCITY',
          payload: {
            x: playerX,
            y: playerY,
            velocityY: velocityY
          }
        });

        // Update platform status
        let onAnyPlatform = false;
        for (const platform of state.platforms) {
          if (checkStandingOnPlatform(playerX, playerY, playerWidth, playerHeight, platform, velocityY)) {
            onAnyPlatform = true;
            break;
          }
        }

        if (state.player.onPlatform !== onAnyPlatform) {
          dispatch({
            type: 'SET_ON_PLATFORM',
            payload: onAnyPlatform
          });
        }
      }
    } else {
      // Explicitly update position for horizontal movement when on platform
      dispatch({
        type: 'PLAYER_MOVE',
        payload: {
          x: playerX,
          y: playerY
        }
      });

      // Check if still on platform while moving horizontally
      let onAnyPlatform = false;
      for (const platform of state.platforms) {
        if (checkStandingOnPlatform(playerX, playerY, playerWidth, playerHeight, platform, 0)) {
          onAnyPlatform = true;
          break;
        }
      }

      // If moved off platform, start falling
      if (!onAnyPlatform && state.player.onPlatform) {
        dispatch({
          type: 'SET_ON_PLATFORM',
          payload: false
        });
      }
    }

    // Detect if position actually changed (debug for stuck movement)
    if (lastPositionRef.current.x !== playerX || lastPositionRef.current.y !== playerY) {
      // Position changed, update last position
      lastPositionRef.current = { x: playerX, y: playerY };
    }

    // Reset shooting state after a short delay (animation effect)
    if (state.player.isShooting && (Date.now() - state.player.lastShootTime > 200)) {
      dispatch({
        type: 'UPDATE_PLAYER',
        payload: { isShooting: false }
      });
    }

    // Apply element-specific effects
    switch (state.player.currentElement) {
      case 'air':
        // Air spirit falls slower
        if (state.player.isJumping && velocityY > 0) {
          velocityY *= 0.9;
          dispatch({
            type: 'UPDATE_VELOCITY_Y',
            payload: velocityY
          });
        }
        break;
      case 'fire':
        // Fire spirit can regenerate energy faster
        if (state.player.energy < state.player.maxEnergy) {
          dispatch({
            type: 'UPDATE_ENERGY',
            payload: state.player.energy + 0.3
          });
        }
        break;
      case 'water':
        // Water spirits can "float" briefly at jump apex
        if (state.player.isJumping && Math.abs(velocityY) < 2) {
          velocityY *= 0.7;
          dispatch({
            type: 'UPDATE_VELOCITY_Y',
            payload: velocityY
          });
        }
        break;
      case 'earth':
        // Earth spirits are more resistant to damage
        // Also they jump higher but fall faster
        if (state.player.isJumping && velocityY > 0) {
          // Fall faster
          velocityY *= 1.05;
          dispatch({
            type: 'UPDATE_VELOCITY_Y',
            payload: velocityY
          });
        }
        break;
      default:
        // Spirit form is balanced
        if (state.player.energy < state.player.maxEnergy) {
          dispatch({
            type: 'UPDATE_ENERGY',
            payload: state.player.energy + 0.1
          });
        }
        break;
    }

    // Auto-health regeneration (very slow)
    if (state.player.health < state.player.maxHealth) {
      dispatch({
        type: 'UPDATE_HEALTH',
        payload: state.player.health + 0.01
      });
    }
    
    // Update projectiles if there are any
    if (state.projectiles.length > 0) {
      dispatch({ type: 'UPDATE_PROJECTILES' });
    }
    
    // Update enemy movements
    if (state.enemies.length > 0) {
      const updatedEnemies = state.enemies.map(enemy => {
        // Calculate distance to player
        const distanceToPlayer = Math.abs(enemy.x - state.player.x);
  
        // Only move if within a certain range (enemy sight)
        if (distanceToPlayer < 400) {
          // Determine direction to player
          const directionToPlayer: 'left' | 'right' = enemy.x < state.player.x ? 'right' : 'left';
  
          // Calculate new x position
          let moveSpeed = enemy.speed * cappedDelta * 60;
          const newX = directionToPlayer === 'right' ?
            enemy.x + moveSpeed :
            enemy.x - moveSpeed;
  
          // Check if movement would cause collision
          let canMove = true;
          let wouldFall = true;
  
          // Check for side collisions with platforms and check if there's ground ahead
          for (const platform of state.platforms) {
            // Check if enemy is at the same height as platform
            if (
              enemy.y >= platform.y - enemy.height &&
              enemy.y <= platform.y + platform.height
            ) {
              // Check if would hit platform from side
              if (directionToPlayer === 'right' &&
                newX + enemy.width / 2 >= platform.x &&
                enemy.x + enemy.width / 2 < platform.x) {
                canMove = false;
              } else if (directionToPlayer === 'left' &&
                newX - enemy.width / 2 <= platform.x + platform.width &&
                enemy.x - enemy.width / 2 > platform.x + platform.width) {
                canMove = false;
              }
            }
  
            // Check if there's ground ahead
            if (
              (directionToPlayer === 'right' &&
                newX + enemy.width / 2 >= platform.x &&
                newX - enemy.width / 2 <= platform.x + platform.width) ||
              (directionToPlayer === 'left' &&
                newX + enemy.width / 2 >= platform.x &&
                newX - enemy.width / 2 <= platform.x + platform.width)
            ) {
              // Check if platform is at the right height
              if (Math.abs(enemy.y - platform.y) < 5) {
                wouldFall = false;
              }
            }
          }
  
          if (canMove && !wouldFall) {
            // Return updated enemy with new position
            return {
              ...enemy,
              x: newX,
              direction: directionToPlayer
            };
          }
        }
  
        // Return unchanged enemy if it can't move
        return enemy;
      });
  
      // Only dispatch if there are actual changes
      const hasChanges = updatedEnemies.some((enemy, index) => 
        enemy.x !== state.enemies[index].x || enemy.direction !== state.enemies[index].direction
      );
  
      if (hasChanges) {
        dispatch({ type: 'UPDATE_ENEMIES', payload: updatedEnemies });
      }
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