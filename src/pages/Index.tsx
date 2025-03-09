
import React, { useEffect } from 'react';
import { GameProvider } from '@/contexts/GameContext';
import GameCanvas from '@/components/GameCanvas';
import MainMenu from '@/components/UI/MainMenu';
import { useGame } from '@/contexts/GameContext';
import { motion, AnimatePresence } from 'framer-motion';

const GameContent = () => {
  const { state } = useGame();
  
  // Debug to track game state changes
  useEffect(() => {
    console.log("Game state updated:", state.isPlaying ? "Playing" : "Not Playing");
  }, [state.isPlaying]);
  
  // Render different screens based on game state
  return (
    <div className="w-full h-full flex items-center justify-center">
      <AnimatePresence mode="wait">
        {!state.isPlaying && (
          <motion.div
            key="main-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full flex items-center justify-center"
          >
            <MainMenu />
          </motion.div>
        )}
        {state.isPlaying && (
          <motion.div
            key="game-canvas"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full"
          >
            <GameCanvas />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Index = () => {
  // Dynamic background elements
  const BackgroundElements = () => {
    return (
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Starry background */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(50, 50, 80, 0.2) 0%, rgba(0, 0, 0, 0) 100%)',
            backgroundSize: '15px 15px',
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          }}
        ></div>
        
        {/* Interactive particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/20"
            style={{
              width: Math.random() * 4 + 1,
              height: Math.random() * 4 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
        
        {/* Distant nebula effects */}
        <div 
          className="absolute opacity-20 rounded-full blur-3xl"
          style={{
            width: '40vw',
            height: '40vw',
            background: 'radial-gradient(circle, rgba(142, 45, 226, 0.5) 0%, rgba(74, 0, 224, 0.1) 100%)',
            left: '70%',
            top: '60%',
            transform: 'translate(-50%, -50%)',
          }}
        ></div>
        
        <div 
          className="absolute opacity-20 rounded-full blur-3xl"
          style={{
            width: '50vw',
            height: '50vw',
            background: 'radial-gradient(circle, rgba(45, 149, 226, 0.5) 0%, rgba(0, 102, 224, 0.1) 100%)',
            left: '20%',
            top: '30%',
            transform: 'translate(-50%, -50%)',
          }}
        ></div>
        
        {/* Animated gradient background */}
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'linear-gradient(120deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)',
            backgroundSize: '200% 200%',
          }}
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        ></motion.div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen w-full overflow-hidden bg-gradient-to-b from-gray-900 to-black text-white">
      <BackgroundElements />
      <GameProvider>
        <GameContent />
      </GameProvider>
    </div>
  );
};

export default Index;
