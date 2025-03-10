import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import { useGameLoop } from '@/hooks/useGameLoop';
import Player from './Player';
import Platform from './Platform';
import Spirit from './Spirit';
import GameHUD from './UI/GameHUD';
import { Play, Home, RotateCcw } from 'lucide-react';

// Enemy component
const Enemy = ({ enemy }) => {
  const { elementColors } = useGame();
  const elementColor = elementColors[enemy.element];

  return (
    <div
      className="absolute transition-transform"
      style={{
        left: enemy.x,
        top: enemy.y,
        transform: `translate(-50%, -100%) scaleX(${enemy.direction === 'left' ? -1 : 1})`,
      }}
    >
      <div
        className="relative rounded-md"
        style={{
          width: enemy.width,
          height: enemy.height,
          backgroundColor: elementColor,
          boxShadow: `0 0 10px ${elementColor}80`,
        }}
      >
        {/* Enemy eyes - gives them character */}
        <div className="absolute top-1/4 left-0 right-0 flex justify-center space-x-2 pointer-events-none">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>

        {/* Health bar */}
        <div className="absolute -top-4 left-0 right-0 h-1 bg-black/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500"
            style={{ width: `${(enemy.health / enemy.maxHealth) * 100}%` }}
          />
        </div>

        {/* Element indicator */}
        <div
          className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-black/50 px-1 rounded"
        >
          {enemy.element}
        </div>
      </div>
    </div>
  );
};

// Projectile component
const Projectile = ({ projectile }) => {
  const { elementColors } = useGame();
  const elementColor = elementColors[projectile.element];

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        left: projectile.x,
        top: projectile.y,
        width: projectile.width,
        height: projectile.height,
        backgroundColor: elementColor,
        boxShadow: `0 0 8px ${elementColor}`,
        transform: 'translate(-50%, -50%)',
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
    />
  );
};

// Element selection UI
const ElementSelection = () => {
  const { state, dispatch, elementColors, elementNames } = useGame();

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-4">
      {state.availableElements.map((element) => (
        <button
          key={element}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${state.player.currentElement === element
              ? 'scale-110 border-2 border-white'
              : 'opacity-70'
            }`}
          style={{
            backgroundColor: elementColors[element],
            boxShadow: state.player.currentElement === element
              ? `0 0 10px 2px ${elementColors[element]}`
              : 'none'
          }}
          onClick={() => dispatch({ type: 'CHANGE_ELEMENT', payload: element })}
        >
          <span className="text-sm font-bold text-white">
            {elementNames[element].charAt(0)}
          </span>
          <div className="absolute -bottom-5 text-xs whitespace-nowrap text-center text-white">
            {elementNames[element]}
          </div>
        </button>
      ))}
    </div>
  );
};

const GameCanvas: React.FC = () => {
  const { state, dispatch } = useGame();
  const { isPlaying, isPaused } = state;
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Initialize game loop
  useGameLoop();

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

  // Mouse tracking for aiming
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (gameContainerRef.current) {
        const rect = gameContainerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Update mouse position
        setMousePosition({ x, y });

        // Calculate direction vector from player to mouse
        const dirX = x - (windowSize.width / 2); // Assuming player is centered
        const dirY = y - state.player.y;

        // Update aim direction in game state
        dispatch({
          type: 'UPDATE_AIM_DIRECTION',
          payload: { x: dirX, y: dirY }
        });
      }
    };

    // Mouse click for shooting
    const handleMouseClick = (e: MouseEvent) => {
      // Only handle left mouse button (0)
      if (e.button === 0 && isPlaying && !isPaused) {
        dispatch({ type: 'PLAYER_SHOOT' });
      }
    };

    // Add event listeners
    if (gameContainerRef.current) {
      gameContainerRef.current.addEventListener('mousemove', handleMouseMove);
      gameContainerRef.current.addEventListener('mousedown', handleMouseClick);
    }

    return () => {
      if (gameContainerRef.current) {
        gameContainerRef.current.removeEventListener('mousemove', handleMouseMove);
        gameContainerRef.current.removeEventListener('mousedown', handleMouseClick);
      }
    };
  }, [isPlaying, isPaused, state.player.x, state.player.y, windowSize]);

  // Add shoot button event handler
  const handleShoot = () => {
    dispatch({ type: 'PLAYER_SHOOT' });
  };
  useEffect(() => {
    if (!isPlaying || isPaused) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w':
          dispatch({ type: 'PLAYER_JUMP' });
          break;
        case 'a':
          dispatch({ type: 'PLAYER_MOVE_LEFT', payload: true });
          break;
        case 'd':
          dispatch({ type: 'PLAYER_MOVE_RIGHT', payload: true });
          break;
        case 's':
          dispatch({ type: 'PLAYER_DUCK', payload: true });
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'a':
          dispatch({ type: 'PLAYER_MOVE_LEFT', payload: false });
          break;
        case 'd':
          dispatch({ type: 'PLAYER_MOVE_RIGHT', payload: false });
          break;
        case 's':
          dispatch({ type: 'PLAYER_DUCK', payload: false });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying, isPaused, dispatch]);

  // Pause screen component
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

  // Game Over screen component
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

  // Controls helper component that shows key instructions
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
          <div>F / Space</div><div>Shoot</div>
          <div>ESC</div><div>Pause</div>
        </div>
      </div>
    ) : null
  );

  // Element tutorial shown at start
  const ElementTutorial = () => (
    state.level === 1 && !isPaused ? (
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white text-center z-10 p-3 bg-black/50 rounded-md backdrop-blur-sm max-w-lg">
        <h3 className="font-bold mb-2">Element Powers</h3>
        <p className="mb-2">Each element has unique abilities and strengths against enemies:</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-left"><span className="font-bold text-red-400">Fire:</span> Strong against Air, weak to Water</div>
          <div className="text-left"><span className="font-bold text-blue-400">Water:</span> Strong against Fire, weak to Earth</div>
          <div className="text-left"><span className="font-bold text-green-400">Earth:</span> Strong against Water, weak to Air</div>
          <div className="text-left"><span className="font-bold text-purple-400">Air:</span> Strong against Earth, weak to Fire</div>
        </div>
        <p className="mt-2 text-xs opacity-70">Press the buttons below or number keys 1-5 to switch elements</p>
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
            transform: `translateX(${Math.min(
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
              canPassThrough={platform.canPassThrough}
            />
          ))}

          {/* Spirits for selection (only show on the first level) */}
          {state.level === 1 && (
            <div className="absolute top-100 left-120 flex space-x-20 items-center">
              {state.availableElements.map((element, index) => (
                <Spirit
                  key={`spirit-intro-${element}`}
                  element={element}
                  x={200 + (index * 120)}
                  y={150}
                />
              ))}
            </div>
          )}

          {/* Enemies */}
          {state.enemies.map((enemy) => (
            <Enemy key={`enemy-${enemy.id}`} enemy={enemy} />
          ))}

          {/* Projectiles */}
          {state.projectiles.map((projectile) => (
            <Projectile key={`projectile-${projectile.id}`} projectile={projectile} />
          ))}

          {/* Player */}
          <Player />
        </div>
      </div>

      {/* Game UI layers */}
      <GameHUD />
      <ElementSelection />
      <ElementTutorial />
      <ControlsHelper />
      <PauseScreen />
      <GameOverScreen />

      {/* Mobile controls overlay (for touch devices) */}
      <div className="md:hidden absolute bottom-20 left-4 right-4 z-30 flex justify-between">
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
          <button
            className="w-16 h-16 rounded-full bg-orange-500/50 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/10"
            onClick={handleShoot}
          >
            ★
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameCanvas;