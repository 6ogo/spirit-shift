
import React from 'react';
import { GameProvider } from '@/contexts/GameContext';
import GameCanvas from '@/components/GameCanvas';
import MainMenu from '@/components/UI/MainMenu';
import { useGame } from '@/contexts/GameContext';

const GameContent = () => {
  const { state } = useGame();
  
  // Render different screens based on game state
  return (
    <div className="w-full h-full">
      {!state.isPlaying && <MainMenu />}
      {state.isPlaying && <GameCanvas />}
    </div>
  );
};

const Index = () => {
  return (
    <div className="min-h-screen w-full overflow-hidden bg-gradient-to-b from-gray-900 to-black text-white">
      <GameProvider>
        <GameContent />
      </GameProvider>
    </div>
  );
};

export default Index;
