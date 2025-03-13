
import React, { useEffect, useState, useRef } from 'react';
import { GameProvider, useGame } from '@/contexts/GameContext';
import GameCanvas from '@/components/GameCanvas';
import MainMenu from '@/components/ui/MainMenu';
import { motion } from 'framer-motion';

// Debug component - toggle with 'D' key
const DebugInfo = ({ state }) => (
  <div className="fixed top-0 left-0 bg-black/90 text-white p-2 z-50 text-xs">
    <div>isPlaying: {String(state.isPlaying)}</div>
    <div>isPaused: {String(state.isPaused)}</div>
    <div>gameOver: {String(state.gameOver)}</div>
    <div>player.x: {Math.round(state.player.x)}</div>
    <div>player.y: {Math.round(state.player.y)}</div>
    <div>player.velocityX: {state.player.velocityX}</div>
    <div>player.velocityY: {Math.round(state.player.velocityY)}</div>
    <div>player.isMovingLeft: {String(state.player.isMovingLeft)}</div>
    <div>player.isMovingRight: {String(state.player.isMovingRight)}</div>
    <div>onPlatform: {String(state.player.onPlatform)}</div>
  </div>
);

// Background visual elements
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
    </div>
  );
};

// GameContent component containing the actual game elements
const GameContent = () => {
  const { state } = useGame();
  const [showDebug, setShowDebug] = useState(false);
  const gameContainerRef = useRef(null);
  
  // Add keyboard handling for debug toggle
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'd' || e.key === 'D') {
        setShowDebug(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // Focus the game container when playing
  useEffect(() => {
    if (state.isPlaying && gameContainerRef.current) {
      gameContainerRef.current.focus();
    }
  }, [state.isPlaying]);
  
  return (
    <div className="w-full h-full flex items-center justify-center" ref={gameContainerRef} tabIndex={-1}>
      {/* Main menu - shown when not playing */}
      {!state.isPlaying && (
        <div className="w-full h-full z-10">
          <MainMenu />
        </div>
      )}
      
      {/* Game canvas - shown when playing */}
      {state.isPlaying && (
        <motion.div 
          className="w-full h-full absolute inset-0 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <GameCanvas />
        </motion.div>
      )}
      
      {/* Optional debug overlay */}
      {showDebug && <DebugInfo state={state} />}
    </div>
  );
};

// Main Index component with error boundary
const Index = () => {
  // Add error boundary handling
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (error) => {
      console.error('Game error caught:', error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Oops! Something went wrong</h1>
          <p className="mb-4">The game encountered an error. Please refresh the page to try again.</p>
          <button 
            className="px-4 py-2 bg-blue-600 rounded-md"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

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
