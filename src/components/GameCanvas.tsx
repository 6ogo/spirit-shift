import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import { useGameLoop, LevelTransition } from '@/hooks/useGameLoop';
import Player from './Player';
import Platform from './Platform';
import GameHUD from './ui/GameHUD';
import { Play, Home, RotateCcw, Flame, Droplet, Leaf, Wind, Ghost, ArrowRight } from 'lucide-react';

const Enemy = ({ enemy }) => {
  const { elementColors } = useGame();
  const elementColor = elementColors[enemy.element];

  return (
    <div
      className="absolute"
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
        <div className="absolute top-1/4 left-0 right-0 flex justify-center space-x-2 pointer-events-none">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>

        <div className="absolute -top-4 left-0 right-0 h-1 bg-black/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500"
            style={{ width: `${(enemy.health / enemy.maxHealth) * 100}%` }}
          />
        </div>

        <div
          className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-black/50 px-1 rounded"
        >
          {enemy.element}
        </div>
      </div>
    </div>
  );
};

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

const getElementIcon = (element) => {
  switch(element) {
    case 'fire':
      return <Flame size={20} className="text-white" />;
    case 'water':
      return <Droplet size={20} className="text-white" />;
    case 'earth':
      return <Leaf size={20} className="text-white" />;
    case 'air':
      return <Wind size={20} className="text-white" />;
    case 'spirit':
    default:
      return <Ghost size={20} className="text-white" />;
  }
};

const ElementSelection = () => {
  const { state, dispatch, elementColors, elementNames } = useGame();
  
  const elementKeyMap = {
    'spirit': '1',
    'fire': '2',
    'water': '3',
    'earth': '4',
    'air': '5'
  };

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-20 flex space-x-6">
      {state.availableElements.map((element) => (
        <button
          key={element}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
            state.player.currentElement === element
              ? 'scale-110 border-2 border-white'
              : 'opacity-70'
          }`}
          style={{
            backgroundColor: elementColors[element],
            boxShadow: state.player.currentElement === element
              ? `0 0 10px ${elementColors[element]}`
              : 'none'
          }}
          onClick={() => {
            dispatch({ type: 'CHANGE_ELEMENT', payload: element });
          }}
        >
          <div className="absolute -top-7 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white border border-white/30">
            {elementKeyMap[element]}
          </div>
          
          {getElementIcon(element)}
          <div className="absolute -bottom-6 text-sm whitespace-nowrap text-center text-white">
            {elementNames[element]}
          </div>
        </button>
      ))}
    </div>
  );
};

const GameCanvas: React.FC = () => {
  const { state, dispatch } = useGame();
  const { isPlaying, isPaused, isTutorialLevel } = state;
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [tutorialVisible, setTutorialVisible] = useState(true);
  const [cameraLocked, setCameraLocked] = useState(true);
  const keyPressRef = useRef({ lastLog: 0 });
  const controlsActive = useRef(false);

  useGameLoop();

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

  useEffect(() => {
    if (state.player.x > 300 && tutorialVisible) {
      setTutorialVisible(false);
    } else if (state.player.x < 200 && !tutorialVisible && isTutorialLevel) {
      setTutorialVisible(true);
    }
    
    if (state.player.x > 350 && cameraLocked) {
      setCameraLocked(false);
    } else if (state.player.x < 250 && !cameraLocked && isTutorialLevel) {
      setCameraLocked(true);
    }
  }, [state.player.x, tutorialVisible, isTutorialLevel, cameraLocked]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (gameContainerRef.current) {
        const rect = gameContainerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setMousePosition({ x, y });

        let cameraOffsetX = 0;
        
        if (!cameraLocked) {
          cameraOffsetX = Math.min(
            Math.max(windowSize.width / 2 - state.player.x, -800 + windowSize.width / 2),
            0
          );
        }
        
        const playerScreenX = state.player.x + cameraOffsetX;
        const playerScreenY = state.player.y - state.player.height / 2;
        
        const dirX = x - playerScreenX;
        const dirY = y - playerScreenY;

        dispatch({
          type: 'UPDATE_AIM_DIRECTION',
          payload: { x: dirX, y: dirY }
        });
      }
    };

    const handleMouseClick = (e: MouseEvent) => {
      if (e.button === 0 && isPlaying && !isPaused) {
        dispatch({ type: 'PLAYER_SHOOT' });
      }
    };

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
  }, [isPlaying, isPaused, state.player.x, state.player.y, windowSize, dispatch, cameraLocked]);

  useEffect(() => {
    console.log("Setting up keyboard controls in GameCanvas");
    
    const gameContainer = gameContainerRef.current;
    
    if (!gameContainer) {
      console.error("Game container ref is null!");
      return;
    }
    
    controlsActive.current = true;
    
    console.log("Adding keyboard event listeners to game container:", gameContainer);
    
    gameContainer.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      // CRITICAL DEBUG: Force log every key press
      console.log(`KEY EVENT DEBUG - Key down: ${e.key}, keyCode: ${e.keyCode}, isPaused: ${isPaused}, active: ${controlsActive.current}, target: ${e.target ? (e.target as Element).tagName : 'unknown'}`);
      
      // CRITICAL FIX: Fix key handling for WASD and arrow keys
      const key = e.key.toLowerCase();
      
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'w', 'a', 's', 'd'].includes(key)) {
        e.preventDefault();
      }
      
      if (key === 'escape') {
        dispatch({ type: 'PAUSE_GAME' });
        return;
      }
      
      if (isPaused) return;
      
      const now = Date.now();
      if (now - keyPressRef.current.lastLog > 1000) {
        console.log("Key press detected:", key);
        keyPressRef.current.lastLog = now;
      }
      
      let updatePosition = false;
      
      // CRITICAL FIX: Use key.toLowerCase() consistently for case-insensitive matching
      switch (key) {
        case 'w':
        case 'arrowup':
          dispatch({ type: 'PLAYER_JUMP' });
          console.log("Jump key pressed");
          break;
        case 'a':
        case 'arrowleft':
          console.log("Left movement key pressed - setting isMovingLeft to true");
          dispatch({ type: 'PLAYER_MOVE_LEFT', payload: true });
          // CRITICAL FIX: Force immediate directional move
          dispatch({ type: 'SET_PLAYER_VELOCITY_X', payload: -10 });
          updatePosition = true;
          break;
        case 'd':
        case 'arrowright':
          console.log("Right movement key pressed - setting isMovingRight to true");
          dispatch({ type: 'PLAYER_MOVE_RIGHT', payload: true });
          // CRITICAL FIX: Force immediate directional move
          dispatch({ type: 'SET_PLAYER_VELOCITY_X', payload: 10 });
          updatePosition = true;
          break;
        case 's':
        case 'arrowdown':
          dispatch({ type: 'PLAYER_DUCK', payload: true });
          console.log("Duck key pressed");
          break;
        case ' ':
          dispatch({ type: 'PLAYER_JUMP' });
          console.log("Space bar pressed for jump");
          break;
        case '1':
          dispatch({ type: 'CHANGE_ELEMENT', payload: 'spirit' });
          break;
        case '2':
          dispatch({ type: 'CHANGE_ELEMENT', payload: 'fire' });
          break;
        case '3':
          dispatch({ type: 'CHANGE_ELEMENT', payload: 'water' });
          break;
        case '4':
          dispatch({ type: 'CHANGE_ELEMENT', payload: 'earth' });
          break;
        case '5':
          dispatch({ type: 'CHANGE_ELEMENT', payload: 'air' });
          break;
        case 'f':
          dispatch({ type: 'PLAYER_SHOOT' });
          break;
      }
      
      if (updatePosition) {
        dispatch({ type: 'UPDATE_PLAYER_POSITION' });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (isPaused) return;
      
      switch (e.key.toLowerCase()) {
        case 'a':
        case 'arrowleft':
          console.log("Left movement key released - setting isMovingLeft to false");
          dispatch({ type: 'PLAYER_MOVE_LEFT', payload: false });
          break;
        case 'd':
        case 'arrowright':
          console.log("Right movement key released - setting isMovingRight to false");
          dispatch({ type: 'PLAYER_MOVE_RIGHT', payload: false });
          break;
        case 's':
        case 'arrowdown':
          dispatch({ type: 'PLAYER_DUCK', payload: false });
          console.log("Duck key released");
          break;
      }
    };

    gameContainer.addEventListener('keydown', handleKeyDown, { capture: true });
    gameContainer.addEventListener('keyup', handleKeyUp, { capture: true });

    return () => {
      controlsActive.current = false;
      gameContainer.removeEventListener('keydown', handleKeyDown, { capture: true });
      gameContainer.removeEventListener('keyup', handleKeyUp, { capture: true });
    };
  }, [isPlaying, isPaused, dispatch]);

  useEffect(() => {
    if (isPlaying && !isPaused && gameContainerRef.current) {
      gameContainerRef.current.focus();
      console.log("Game container focused");
    }
  }, [isPlaying, isPaused]);

  const PauseScreen = () => (
    isPaused ? (
      <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-black/50 backdrop-blur-sm">
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

  const GameOverScreen = () => (
    state.gameOver ? (
      <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-black/60 backdrop-blur-sm">
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

  const StartPlayingPrompt = () => (
    isPlaying && !isPaused && state.level === 1 && tutorialVisible ? (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20, transition: { duration: 0.4 } }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="absolute bottom-32 right-10 text-white text-center z-40"
      >
        <div className="glass-panel border border-white/30 p-6 rounded-lg shadow-xl flex flex-col items-center backdrop-blur-md bg-black/30">
          <p className="text-2xl font-bold mb-4 text-gradient">Game Controls</p>
          
          <div className="grid grid-cols-2 gap-x-5 gap-y-2 mb-5 text-left">
            <div className="flex items-center gap-2">
              <kbd className="bg-white/30 px-2 py-1 rounded text-xs">W</kbd>
              <kbd className="bg-white/30 px-2 py-1 rounded text-xs">↑</kbd>
              <kbd className="bg-white/30 px-2 py-1 rounded text-xs">Space</kbd>
            </div>
            <div>Jump</div>
            
            <div className="flex items-center gap-2">
              <kbd className="bg-white/30 px-2 py-1 rounded text-xs">A</kbd>
              <kbd className="bg-white/30 px-2 py-1 rounded text-xs">←</kbd>
            </div>
            <div>Move Left</div>
            
            <div className="flex items-center gap-2">
              <kbd className="bg-white/30 px-2 py-1 rounded text-xs">D</kbd>
              <kbd className="bg-white/30 px-2 py-1 rounded text-xs">→</kbd>
            </div>
            <div>Move Right</div>
            
            <div className="flex items-center gap-2">
              <kbd className="bg-white/30 px-2 py-1 rounded text-xs">F</kbd>
              <kbd className="bg-white/30 px-2 py-1 rounded text-xs">Click</kbd>
            </div>
            <div>Shoot</div>
            
            <div className="flex items-center gap-2">
              <kbd className="bg-white/30 px-2 py-1 rounded text-xs">1-5</kbd>
            </div>
            <div>Change Element</div>
            
            <div className="flex items-center gap-2">
              <kbd className="bg-white/30 px-2 py-1 rounded text-xs">ESC</kbd>
            </div>
            <div>Pause</div>
          </div>
          
          <div className="mt-4 flex items-center justify-center gap-3">
            <motion.div
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowRight size={24} className="text-white" />
            </motion.div>
            <p className="font-bold text-gradient">Move right to begin</p>
          </div>
          
          <button 
            className="mt-4 px-4 py-2 bg-white/20 rounded-md hover:bg-white/30 transition-colors"
            onClick={() => setTutorialVisible(false)}
          >
            Close
          </button>
        </div>
      </motion.div>
    ) : null
  );

  const renderDebugUI = () => {
    if (!state.isPlaying) return null;
    
    const handleMoveLeft = () => {
      dispatch({ type: 'PLAYER_MOVE_LEFT', payload: true });
      dispatch({ type: 'SET_PLAYER_VELOCITY_X', payload: -5 });
    };
    
    const handleMoveRight = () => {
      dispatch({ type: 'PLAYER_MOVE_RIGHT', payload: true });
      dispatch({ type: 'SET_PLAYER_VELOCITY_X', payload: 5 });
    };
    
    const handleJump = () => {
      dispatch({ type: 'PLAYER_JUMP' });
    };
    
    return (
      <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-4 z-50">
        <button 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onMouseDown={handleMoveLeft}
          onMouseUp={() => dispatch({ type: 'PLAYER_MOVE_LEFT', payload: false })}
          onTouchStart={handleMoveLeft}
          onTouchEnd={() => dispatch({ type: 'PLAYER_MOVE_LEFT', payload: false })}
        >
          ← Left
        </button>
        <button 
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleJump}
        >
          Jump
        </button>
        <button 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onMouseDown={handleMoveRight}
          onMouseUp={() => dispatch({ type: 'PLAYER_MOVE_RIGHT', payload: false })}
          onTouchStart={handleMoveRight}
          onTouchEnd={() => dispatch({ type: 'PLAYER_MOVE_RIGHT', payload: false })}
        >
          Right →
        </button>
      </div>
    );
  };

  const cameraPosition = cameraLocked
    ? "translate3d(0px, 0px, 0px)"
    : `translate3d(${Math.min(
        Math.max(windowSize.width / 2 - state.player.x, -800 + windowSize.width / 2),
        0
      )}px, 0px, 0px)`;
      
  useEffect(() => {
    console.log("Player position changed: ", state.player.x, state.player.y);
    // This empty effect makes sure component re-renders when player position changes
  }, [state.player.x, state.player.y]);
  
  useEffect(() => {
    if (isPlaying && cameraLocked) {
      setTimeout(() => {
        console.log("Unlocking camera to show player movement");
        setCameraLocked(false);
      }, 1000);
    }
  }, [isPlaying]);

  const [showDebugControls, setShowDebugControls] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (state.isPlaying && !state.isPaused) {
        dispatch({ type: 'PLAYER_MOVE', payload: { x: state.player.x + 1, y: state.player.y } });
        console.log("FORCED MOVEMENT: Moving player to x=" + (state.player.x + 1));
      }
    }, 100);

    const handleDebugKey = (e: KeyboardEvent) => {
      if (e.key === '`') {
        setShowDebugControls(prev => !prev);
        console.log("Debug controls toggled:", !showDebugControls);
      }
    };

    window.addEventListener('keydown', handleDebugKey);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleDebugKey);
    };
  }, [state.isPlaying, state.isPaused, state.player.x, state.player.y, dispatch]);

  return (
    <div
      ref={gameContainerRef}
      className="game-container relative overflow-hidden bg-gradient-to-b from-gray-900 via-gray-800 to-black focus:outline-none"
      style={{
        width: '100%',
        height: '100%'
      }}
      tabIndex={0}
    >
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundSize: '10px 10px',
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
        }}
      ></div>

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

      <div className="absolute inset-0">
        <div
          className="absolute will-change-transform hardware-accelerated"
          style={{
            transform: cameraPosition
          }}
        >
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

          {state.enemies.map((enemy) => (
            <Enemy key={`enemy-${enemy.id}`} enemy={enemy} />
          ))}

          {state.projectiles.map((projectile) => (
            <Projectile key={`projectile-${projectile.id}`} projectile={projectile} />
          ))}

          <Player />
        </div>
      </div>

      <GameHUD />
      <ElementSelection />
      
      <AnimatePresence>
        {tutorialVisible && (
          <StartPlayingPrompt />
        )}
      </AnimatePresence>
      
      <PauseScreen />
      <GameOverScreen />
      <LevelTransition />
      
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
            onClick={() => dispatch({ type: 'PLAYER_SHOOT' })}
          >
            ★
          </button>
        </div>
      </div>
      {renderDebugUI()}
    </div>
  );
};

export { GameCanvas };
