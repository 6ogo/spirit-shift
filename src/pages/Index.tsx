
import React from 'react';
import { GameProvider } from '@/contexts/GameContext';
import GameCanvas from '@/components/GameCanvas';

const Index = () => {
  return (
    <div className="min-h-screen overflow-hidden bg-black text-white">
      <GameProvider>
        <GameCanvas />
      </GameProvider>
    </div>
  );
};

export default Index;
