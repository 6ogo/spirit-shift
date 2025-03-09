
import { useEffect, useRef } from 'react';
import { useGame } from '@/contexts/GameContext';

export interface GameLoopProps {
  fps?: number;
}

export const useGameLoop = ({ fps = 60 }: GameLoopProps = {}) => {
  const { state, dispatch } = useGame();
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const fpsInterval = 1000 / fps;
  
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
  
  const updateGameState = (deltaTime: number) => {
    // Gravity effect - adjusted for deltaTime
    const gravity = 0.8 * 60 * deltaTime;
    
    // Update player position
    let playerX = state.player.x;
    let playerY = state.player.y;
    let velocityX = state.player.velocityX;
    let velocityY = state.player.velocityY;
    
    // Apply horizontal movement - smoother with deltaTime
    playerX += velocityX * deltaTime * 60;
    
    // Apply gravity if the player is jumping
    if (state.player.isJumping) {
      velocityY += gravity;
      playerY += velocityY * deltaTime * 60;
      
      // Check if player has landed
      if (playerY >= 300) { // Ground level
        playerY = 300;
        dispatch({ type: 'PLAYER_LAND' });
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
    } else if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [state.isPlaying, state.isPaused, state.gameOver]);
  
  return { state };
};
