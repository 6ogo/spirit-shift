import React, { useEffect, useState } from 'react';
import { GameProvider, useGame } from '@/contexts/GameContext';
import GameCanvas from '@/components/GameCanvas';
import MainMenu from '@/components/UI/MainMenu';
import { motion } from 'framer-motion';

// Simple debug component to help troubleshoot
const DebugInfo = ({ state }) => (
  <div className="fixed top-0 left-0 bg-black/70 text-white p-2 z-50 text-xs">
    <div>isPlaying: {String(state.isPlaying)}</div>
    <div>isPaused: {String(state.isPaused)}</div>
    <div>gameOver: {String(state.gameOver)}</div>
    <div>player.x: {state.player.x}</div>
    <div>player.y: {state.player.y}</div>
  </div>
);

// GameContent component with simplified approach
const GameContent = () => {
  const { state, dispatch } = useGame();
  const [showDebug, setShowDebug] = useState(true);
  
  // Add key handling to toggle debug info with D key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'd' || e.key === 'D') {
        setShowDebug(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // Log state changes to help debug
  useEffect(() => {
    console.log("STATE UPDATE:", 
      { isPlaying: state.isPlaying, isPaused: state.isPaused, gameOver: state.gameOver });
    
    // Force a re-render whenever the game state changes
    if (state.isPlaying) {
      // This is a simple hack to ensure the component re-renders
      setTimeout(() => {
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
          console.log("Game container found and updated");
          (gameContainer as HTMLElement).style.display = 'block';
        } else {
          console.error("Game container not found in DOM");
        }
      }, 100);
    }
  }, [state.isPlaying, state.isPaused, state.gameOver]);
  
  return (
    <div className="w-full h-full flex items-center justify-center">
      {/* Conditionally render content based on game state */}
      {!state.isPlaying && (
        <div className="w-full h-full z-10">
          <MainMenu />
        </div>
      )}
      
      {state.isPlaying && (
        <div className="w-full h-full absolute inset-0 z-20">
          <GameCanvas />
        </div>
      )}
      
      {/* Always-visible debug overlay (toggle with D key) */}
      {showDebug && <DebugInfo state={state} />}
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

// Main Index component
const Index = () => {
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