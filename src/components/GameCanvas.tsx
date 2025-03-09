
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import { useGameLoop } from '@/hooks/useGameLoop';
import Player from './Player';
import Platform from './Platform';
import Spirit from './Spirit';
import GameHUD from './UI/GameHUD';

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
  
  // Start screen component
  const StartScreen = () => (
    <AnimatePresence>
      {!isPlaying && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="game-title"
          >
            SPIRIT SHIFT
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="game-subtitle mt-2 mb-8"
          >
            Possess elemental spirits. Master their powers.
          </motion.div>
          
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-lg font-bold tracking-wide text-lg shadow-lg"
            onClick={() => dispatch({ type: 'START_GAME' })}
          >
            START GAME
          </motion.button>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-sm text-white/60"
          >
            Use arrow keys or WASD to move | Space to jump | 1-5 to change spirits
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
  
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
            className="glass-panel p-8 flex flex-col items-center"
          >
            <div className="text-2xl font-bold mb-4">PAUSED</div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-white text-black rounded font-bold"
              onClick={() => dispatch({ type: 'RESUME_GAME' })}
            >
              RESUME
            </motion.button>
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
      {isPlaying && <GameHUD />}
      <StartScreen />
      <PauseScreen />
    </div>
  );
};

export default GameCanvas;
