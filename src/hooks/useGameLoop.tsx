
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
      if (state.isPlaying && !state.isPaused) {
        updateGameState(elapsed);
      }
      
      previousTimeRef.current = time - (elapsed % fpsInterval);
    }
    
    requestRef.current = requestAnimationFrame(gameLoop);
  };
  
  const updateGameState = (elapsed: number) => {
    // Gravity effect
    const gravity = 0.8;
    
    // Update player position
    let playerY = state.player.y;
    let velocityY = state.player.velocityY;
    
    // Apply gravity if the player is jumping
    if (state.player.isJumping) {
      velocityY += gravity;
      playerY += velocityY;
      
      // Check if player has landed
      if (playerY >= 300) { // Ground level
        playerY = 300;
        dispatch({ type: 'PLAYER_LAND' });
      } else {
        dispatch({ 
          type: 'PLAYER_MOVE', 
          payload: { 
            x: state.player.x, 
            y: playerY 
          } 
        });
      }
    }
    
    // Apply element-specific effects
    switch (state.player.currentElement) {
      case 'air':
        // Air spirit falls slower
        if (state.player.isJumping && velocityY > 0) {
          velocityY *= 0.9;
        }
        break;
      case 'fire':
        // Fire spirit can regenerate energy faster
        if (state.player.energy < state.player.maxEnergy) {
          dispatch({ 
            type: 'UPDATE_ENERGY', 
            payload: state.player.energy + 0.2 
          });
        }
        break;
      case 'water':
        // Water spirits can "float" briefly at jump apex
        if (state.player.isJumping && Math.abs(velocityY) < 2) {
          velocityY *= 0.7;
        }
        break;
      case 'earth':
        // Earth spirits are more resistant to damage
        // (no implementation needed in the game loop)
        break;
      default:
        // Spirit form is balanced
        break;
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
  }, [state.isPlaying, state.isPaused]);
  
  return { state };
};
