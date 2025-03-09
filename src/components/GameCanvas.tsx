
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import { useGameLoop } from '@/hooks/useGameLoop';
import Player from './Player';
import Platform from './Platform';
import Spirit from './Spirit';
import GameHUD from './UI/GameHUD';
import { Play, Home, RotateCcw } from 'lucide-react';

const GameCanvas: React.FC = () => {
  const { state, dispatch } = useGame();
  const { isPlaying, isPaused } = state;
  
  // Initialize game loop
  useGameLoop();
  
  // Platforms (would be procedurally generated in a full game)
  const platforms = [
    // Ground
    { x: 0, y: 350, width: 1600, element: 'spirit' as const },
    
    // Floating platforms
    { x: 200, y: 250, width: 100, element: 'fire' as const },
    { x: 400, y: 200, width: 120, element: 'water' as const },
    { x: 600, y: 250, width: 80, element: 'earth' as const },
    { x: 800, y: 180, width: 100, element: 'air' as const },
  ];
  
  // Spirits (would be procedurally placed in a full game)
  const spirits = [
    { x: 300, y: 200, element: 'fire' as const },
    { x: 500, y: 150, element: 'water' as const },
    { x: 700, y: 200, element: 'earth' as const },
    { x: 900, y: 130, element: 'air' as const },
  ];
  
  // Handle window resize for responsiveness
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Pause screen component
  const PauseScreen = () => (
    <AnimatePresence>
      {isPaused && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-8 flex flex-col items-center gap-6 rounded-xl"
          >
            <div className="text-3xl font-bold mb-2 text-gradient">PAUSED</div>
            
            <div className="flex flex-col gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-2 w-48 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold"
                onClick={() => dispatch({ type: 'RESUME_GAME' })}
              >
                <Play size={20} />
                RESUME
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-2 w-48 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full font-bold"
                onClick={() => dispatch({ type: 'RESTART_GAME' })}
              >
                <RotateCcw size={20} />
                RESTART
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-2 w-48 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full font-bold"
                onClick={() => dispatch({ type: 'END_GAME' })}
              >
                <Home size={20} />
                MAIN MENU
              </motion.button>
            </div>
            
            <div className="mt-4 text-sm text-white/60">
              Press ESC to resume
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
  
  // Game Over screen component
  const GameOverScreen = () => (
    <AnimatePresence>
      {state.gameOver && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-8 flex flex-col items-center gap-6 rounded-xl"
          >
            <div className="text-3xl font-bold mb-2 text-red-500">GAME OVER</div>
            <div className="text-xl mb-4">Score: {state.score}</div>
            
            <div className="flex flex-col gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-2 w-48 px-6 py-3 bg-gradient-to-r from-red-600 to-purple-600 text-white rounded-full font-bold"
                onClick={() => dispatch({ type: 'RESTART_GAME' })}
              >
                <RotateCcw size={20} />
                TRY AGAIN
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-2 w-48 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full font-bold"
                onClick={() => dispatch({ type: 'END_GAME' })}
              >
                <Home size={20} />
                MAIN MENU
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
  
  return (
    <div 
      className="game-container relative overflow-hidden bg-gradient-to-b from-gray-900 via-gray-800 to-black"
      style={{
        perspective: '1000px',
      }}
    >
      {/* Dynamic background elements based on current element */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundSize: '10px 10px',
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
        }}
      ></div>
      
      {/* Element-specific ambient effects */}
      <AnimatePresence mode="wait">
        <motion.div
          key={state.player.currentElement}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 pointer-events-none"
        >
          {state.player.currentElement === 'fire' && (
            <div className="absolute inset-0 bg-gradient-to-t from-red-900/30 to-transparent"></div>
          )}
          {state.player.currentElement === 'water' && (
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 to-transparent"></div>
          )}
          {state.player.currentElement === 'earth' && (
            <div className="absolute inset-0 bg-gradient-to-t from-green-900/30 to-transparent"></div>
          )}
          {state.player.currentElement === 'air' && (
            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/30 to-transparent"></div>
          )}
        </motion.div>
      </AnimatePresence>
      
      {/* Game elements container - where game objects get positioned */}
      <div className="absolute inset-0">
        {/* Camera follows player horizontally */}
        <div 
          className="absolute transition-transform duration-300 ease-out"
          style={{ 
            transform: `translateX(${
              Math.min(
                Math.max(windowSize.width / 2 - state.player.x, -800 + windowSize.width / 2),
                0
              )
            }px)` 
          }}
        >
          {/* Platforms */}
          {platforms.map((platform, index) => (
            <Platform
              key={`platform-${index}`}
              x={platform.x}
              y={platform.y}
              width={platform.width}
              element={platform.element}
            />
          ))}
          
          {/* Spirits */}
          {spirits.map((spirit, index) => (
            <Spirit
              key={`spirit-${index}`}
              element={spirit.element}
              x={spirit.x}
              y={spirit.y}
            />
          ))}
          
          {/* Player */}
          <Player />
        </div>
      </div>
      
      {/* Game UI layers */}
      <GameHUD />
      <PauseScreen />
      <GameOverScreen />
      
      {/* Mobile controls overlay (for touch devices) */}
      <div className="md:hidden absolute bottom-4 left-4 right-4 z-30 flex justify-between">
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"
            onTouchStart={() => dispatch({ type: 'PLAYER_MOVE_LEFT', payload: true })}
            onTouchEnd={() => dispatch({ type: 'PLAYER_MOVE_LEFT', payload: false })}
          >
            ←
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"
            onTouchStart={() => dispatch({ type: 'PLAYER_MOVE_RIGHT', payload: true })}
            onTouchEnd={() => dispatch({ type: 'PLAYER_MOVE_RIGHT', payload: false })}
          >
            →
          </motion.button>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"
          onClick={() => dispatch({ type: 'PLAYER_JUMP' })}
        >
          ↑
        </motion.button>
      </div>
    </div>
  );
};

export default GameCanvas;
