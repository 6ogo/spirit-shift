import React, { useEffect, useState } from 'react';
import { GameProvider, useGame } from '@/contexts/GameContext';
import GameCanvas from '@/components/GameCanvas';
import MainMenu from '@/components/UI/MainMenu';
import { motion, AnimatePresence } from 'framer-motion';

// GameContent component with error handling
const GameContent = () => {
  const { state } = useGame();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Debug to track game state changes
  useEffect(() => {
    console.log("Game state updated:", state.isPlaying ? "Playing" : "Not Playing");
    
    if (state.isPlaying) {
      // Add a small delay to ensure DOM is ready before rendering GameCanvas
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [state.isPlaying]);
  
  // Error boundary effect
  useEffect(() => {
    const handleError = (error) => {
      console.error("Game canvas error:", error);
      setError(error);
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  
  // If an error occurred, show error screen
  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-white bg-red-900/20">
        <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
        <p className="mb-4">There was an error loading the game.</p>
        <button 
          className="px-4 py-2 bg-white text-black rounded-md"
          onClick={() => window.location.reload()}
        >
          Reload Game
        </button>
      </div>
    );
  }
  
  // Render different screens based on game state
  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden">
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
        
        {isLoading && state.isPlaying && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full flex items-center justify-center"
          >
            <div className="glass-panel p-8 rounded-xl flex flex-col items-center">
              <div className="text-2xl font-bold text-gradient mb-4">Loading Game...</div>
              <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-white"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
              </div>
            </div>
          </motion.div>
        )}
        
        {!isLoading && state.isPlaying && (
          <motion.div
            key="game-canvas"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.7, 
              scale: { type: "spring", stiffness: 300, damping: 25 },
              opacity: { duration: 0.3 }
            }}
            className="w-full h-full"
          >
            <GameCanvas />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Background elements component
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

// Main Index component with error handling wrapper
const Index = () => {
  const [gameError, setGameError] = useState(null);
  
  // Error handler for the entire game
  const handleGameError = (error) => {
    console.error("Game error:", error);
    setGameError(error);
  };
  
  if (gameError) {
    return (
      <div className="min-h-screen w-full overflow-hidden bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center p-8 bg-red-900/20 rounded-lg">
          <h1 className="text-3xl font-bold mb-4">Game Error</h1>
          <p className="mb-6">Something went wrong with the game. Please try again.</p>
          <button 
            className="px-4 py-2 bg-white text-black rounded-md"
            onClick={() => window.location.reload()}
          >
            Reload Game
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen w-full overflow-hidden bg-gradient-to-b from-gray-900 to-black text-white">
      <BackgroundElements />
      <ErrorBoundary onError={handleGameError}>
        <GameProvider>
          <GameContent />
        </GameProvider>
      </ErrorBoundary>
    </div>
  );
};

// Simple error boundary component
interface ErrorBoundaryProps {
  onError?: (error: Error) => void;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Game error boundary caught error:", error, errorInfo);
    this.props.onError && this.props.onError(error);
  }

  render() {
    if (this.state.hasError) {
      return null; // Parent will handle the error display
    }

    return this.props.children;
  }
}

export default Index;