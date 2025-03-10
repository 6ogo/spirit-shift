import React, { useState, useEffect, useRef } from 'react';
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
  const gameContainerRef = useRef<HTMLDivElement>(null);
  
  // Debug mode for troubleshooting
  const [debug, setDebug] = useState(false);
  
  // Initialize game loop
  useGameLoop();
  
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
  
  // Log component mounting for debugging
  useEffect(() => {
    console.log("GameCanvas component mounted");
    
    // Explicit testing of DOM presence
    if (gameContainerRef.current) {
      console.log("GameContainer ref is connected to DOM");
    } else {
      console.error("GameContainer ref is NOT connected to DOM");
    }
    
    return () => {
      console.log("GameCanvas component unmounted");
    };
  }, []);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Debug mode toggle
      if (e.key === 'F2') {
        setDebug(prev => !prev);
        console.log("Debug mode:", !debug);
      }
      
      // Pause handling
      if (isPaused && e.key === 'Escape') {
        dispatch({ type: 'RESUME_GAME' });
      } else if (isPlaying && !isPaused && e.key === 'Escape') {
        dispatch({ type: 'PAUSE_GAME' });
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isPaused, dispatch, debug]);
  
  // Pause screen component with simplified rendering
  const PauseScreen = () => (
    isPaused ? (
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/50 backdrop-blur-sm">
        <div className="glass-panel p-8 flex flex-col items-center gap-6 rounded-xl">
          <div className="text-3xl font-bold mb-2 text-gradient">PAUSED</div>
          
          <div className="flex flex-col gap-3">
            <button
              className="flex items-center justify-center gap-2 w-48 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold"
              onClick={() => dispatch({ type: 'RESUME_GAME' })}
            >
              <Play size={20} />
              RESUME
            </button>
            
            <button
              className="flex items-center justify-center gap-2 w-48 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full font-bold"
              onClick={() => dispatch({ type: 'RESTART_GAME' })}
            >
              <RotateCcw size={20} />
              RESTART
            </button>
            
            <button
              className="flex items-center justify-center gap-2 w-48 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full font-bold"
              onClick={() => dispatch({ type: 'END_GAME' })}
            >
              <Home size={20} />
              MAIN MENU
            </button>
          </div>
          
          <div className="mt-4 text-sm text-white/60">
            Press ESC to resume
          </div>
        </div>
      </div>
    ) : null
  );
  
  // Game Over screen component with simplified rendering
  const GameOverScreen = () => (
    state.gameOver ? (
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/60 backdrop-blur-sm">
        <div className="glass-panel p-8 flex flex-col items-center gap-6 rounded-xl">
          <div className="text-3xl font-bold mb-2 text-red-500">GAME OVER</div>
          <div className="text-xl mb-4">Score: {state.score}</div>
          
          <div className="flex flex-col gap-3">
            <button
              className="flex items-center justify-center gap-2 w-48 px-6 py-3 bg-gradient-to-r from-red-600 to-purple-600 text-white rounded-full font-bold"
              onClick={() => dispatch({ type: 'RESTART_GAME' })}
            >
              <RotateCcw size={20} />
              TRY AGAIN
            </button>
            
            <button
              className="flex items-center justify-center gap-2 w-48 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full font-bold"
              onClick={() => dispatch({ type: 'END_GAME' })}
            >
              <Home size={20} />
              MAIN MENU
            </button>
          </div>
        </div>
      </div>
    ) : null
  );
  
  // Debug overlay
  const DebugOverlay = () => (
    debug ? (
      <div className="absolute top-20 left-4 bg-black/70 p-2 rounded text-xs text-white z-50">
        <div>Player X: {state.player.x.toFixed(2)}</div>
        <div>Player Y: {state.player.y.toFixed(2)}</div>
        <div>Velocity X: {state.player.velocityX.toFixed(2)}</div>
        <div>Velocity Y: {state.player.velocityY.toFixed(2)}</div>
        <div>Is Jumping: {String(state.player.isJumping)}</div>
        <div>Is On Platform: {String(state.player.onPlatform)}</div>
        <div>Element: {state.player.currentElement}</div>
      </div>
    ) : null
  );
  
  // Controls helper with simplified rendering
  const ControlsHelper = () => (
    isPlaying && !isPaused ? (
      <div className="absolute top-4 right-4 text-white text-sm bg-black/50 p-3 rounded-md backdrop-blur-sm z-10 border border-white/10">
        <h3 className="font-bold mb-2">Controls:</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div>W / Space / ↑</div><div>Jump</div>
          <div>A / ←</div><div>Move Left</div>
          <div>D / →</div><div>Move Right</div>
          <div>S / ↓</div><div>Duck</div>
          <div>1-5</div><div>Change Element</div>
          <div>ESC</div><div>Pause</div>
          <div>F2</div><div>Debug</div>
        </div>
      </div>
    ) : null
  );
  
  return (
    <div 
      ref={gameContainerRef}
      className="game-container relative overflow-hidden bg-gradient-to-b from-gray-900 via-gray-800 to-black"
      style={{
        width: '100%',
        height: '100%'
      }}
    >
      {/* Main content of game */}
      <div className="absolute inset-0">
        {/* Dynamic background elements based on current element */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundSize: '10px 10px',
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          }}
        ></div>
        
        {/* Element-specific ambient effects */}
        <div className="absolute inset-0 pointer-events-none">
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
        </div>
        
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
            {state.platforms.map((platform, index) => (
              <Platform
                key={`platform-${index}`}
                x={platform.x}
                y={platform.y}
                width={platform.width}
                height={platform.height}
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
        <ControlsHelper />
        <PauseScreen />
        <GameOverScreen />
        <DebugOverlay />
        
        {/* Mobile controls overlay (for touch devices) */}
        <div className="md:hidden absolute bottom-4 left-4 right-4 z-30 flex justify-between">
          <div className="flex gap-2">
            <button
              className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/10"
              onTouchStart={() => dispatch({ type: 'PLAYER_MOVE_LEFT', payload: true })}
              onTouchEnd={() => dispatch({ type: 'PLAYER_MOVE_LEFT', payload: false })}
            >
              ←
            </button>
            <button
              className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/10"
              onTouchStart={() => dispatch({ type: 'PLAYER_MOVE_RIGHT', payload: true })}
              onTouchEnd={() => dispatch({ type: 'PLAYER_MOVE_RIGHT', payload: false })}
            >
              →
            </button>
          </div>
          
          <div className="flex gap-2">
            <button
              className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/10"
              onTouchStart={() => dispatch({ type: 'PLAYER_DUCK', payload: true })}
              onTouchEnd={() => dispatch({ type: 'PLAYER_DUCK', payload: false })}
            >
              ↓
            </button>
            <button
              className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/10"
              onClick={() => dispatch({ type: 'PLAYER_JUMP' })}
            >
              ↑
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameCanvas;