import { useEffect, useRef } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Platform } from '@/contexts/GameContext';

export interface GameLoopProps {
  fps?: number;
}

export const useGameLoop = ({ fps = 60 }: GameLoopProps = {}) => {
  const { state, dispatch } = useGame();
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const fpsInterval = 1000 / fps;
  
  // Store the last position to detect movement issues
  const lastPositionRef = useRef({ x: 0, y: 0 });
  
  const gameLoop = (time: number) => {
    if (previousTimeRef.current === undefined) {
      previousTimeRef.current = time;
    }
    
    const elapsed = time - previousTimeRef.current;
    
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
    // Debug movement speed - ensure it's not too slow to notice
    // console.log("Delta time:", deltaTime, "Movement speed:", state.player.velocityX * deltaTime * 60);
    
    // Gravity effect - adjusted for deltaTime
    const gravity = 0.8 * 60 * deltaTime;
    
    // Update player position
    let playerX = state.player.x;
    let playerY = state.player.y;
    let velocityX = state.player.velocityX;
    let velocityY = state.player.velocityY;
    let playerWidth = state.player.width;
    let playerHeight = state.player.height;
    
    // IMPORTANT: Force a minimum velocity when moving to ensure movement is visible
    // This fixes cases where deltaTime is so small that movement isn't apparent
    if (state.player.isMovingLeft) {
      const moveSpeed = state.player.isDucking ? 3 : 5; // Slower when ducking
      velocityX = -moveSpeed; 
    } else if (state.player.isMovingRight) {
      const moveSpeed = state.player.isDucking ? 3 : 5; // Slower when ducking
      velocityX = moveSpeed;
    }
    
    // Apply horizontal movement - apply a minimum movement to ensure it's visible
    const minMovement = 3; // Minimum pixels to move per frame
    if (velocityX > 0) {
      playerX += Math.max(velocityX * deltaTime * 60, minMovement);
    } else if (velocityX < 0) {
      playerX += Math.min(velocityX * deltaTime * 60, -minMovement);
    }
    
    // Debug output if position hasn't changed significantly
    if (Math.abs(playerX - lastPositionRef.current.x) < 0.01 && Math.abs(velocityX) > 0) {
      console.warn("Player not moving despite velocity:", velocityX);
    }
    
    // Update last position reference
    lastPositionRef.current = { x: playerX, y: playerY };
    
    // Ensure player doesn't go off-screen horizontally
    playerX = Math.max(playerWidth / 2, Math.min(1600 - playerWidth / 2, playerX));
    
    // Apply gravity if the player is jumping or not on a platform
    if (state.player.isJumping || !state.player.onPlatform) {
      velocityY += gravity;
      playerY += velocityY * deltaTime * 60;
      
      // Check if player landed on any platform
      let landed = false;
      let platformLandedOn = null;
      
      for (const platform of state.platforms) {
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
          // Bounce off the bottom of the platform
          velocityY = Math.abs(velocityY) * 0.3; // Reduced bounce
          
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
        // Update player position with new velocityY for proper physics
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
      // Even when not jumping, update X position for smoother movement
      dispatch({ 
        type: 'PLAYER_MOVE', 
        payload: { 
          x: playerX, 
          y: playerY
        } 
      });
      
      // Still check if player is on platform while moving horizontally
      let onAnyPlatform = false;
      for (const platform of state.platforms) {
        if (checkStandingOnPlatform(playerX, playerY, playerWidth, playerHeight, platform, 0)) {
          onAnyPlatform = true;
          break;
        }
      }
      
      // If moved off the platform, start falling
      if (!onAnyPlatform && state.player.onPlatform) {
        dispatch({
          type: 'SET_ON_PLATFORM',
          payload: false
        });
      }
    }
    
    // Apply element-specific effects
    switch (state.player.currentElement) {
      case 'air':
        // Air spirit falls slower
        if (state.player.isJumping && velocityY > 0) {
          velocityY *= 0.9;
          // Update with reduced falling speed
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
            payload: state.player.energy + 0.3 // Increased regeneration
          });
        }
        break;
      case 'water':
        // Water spirits can "float" briefly at jump apex
        if (state.player.isJumping && Math.abs(velocityY) < 2) {
          velocityY *= 0.7;
          // Update with reduced falling speed
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
            payload: state.player.energy + 0.1 // Small energy regeneration
          });
        }
        break;
    }
    
    // Auto-health regeneration (very slow)
    if (state.player.health < state.player.maxHealth) {
      dispatch({
        type: 'UPDATE_HEALTH',
        payload: state.player.health + 0.01 // Very slow health regen
      });
    }
  };
  
  useEffect(() => {
    if (state.isPlaying && !state.isPaused) {
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