
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame, ElementType } from '@/contexts/GameContext';

const GameHUD: React.FC = () => {
  const { state, dispatch, elementColors, elementNames } = useGame();
  const { player, score } = state;
  
  // Element selection icons have been moved to the GameCanvas component
  // to ensure they're properly positioned at the bottom

  // Progress bar component
  const ProgressBar: React.FC<{ 
    value: number, 
    maxValue: number, 
    label: string, 
    color: string,
    className?: string,
    animate?: boolean
  }> = ({ value, maxValue, label, color, className = "", animate = true }) => {
    const percentage = (value / maxValue) * 100;
    
    return (
      <motion.div 
        initial={{ opacity: 0, width: 0 }}
        animate={{ opacity: 1, width: 'auto' }}
        className={`glass-panel p-2 flex-1 ${className}`}
      >
        <div className="flex justify-between items-center mb-1">
          <div className="text-xs text-white/80">{label}</div>
          <div className="text-xs font-bold">{Math.round(value)}/{maxValue}</div>
        </div>
        <div className="h-2 bg-black/50 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: percentage > 0 ? `${percentage}%` : '0%' }}
            animate={{ width: `${percentage}%` }}
            transition={{ 
              type: animate ? "spring" : "tween", 
              stiffness: 100, 
              damping: 15
            }}
            style={{ 
              backgroundColor: color,
              boxShadow: `0 0 5px ${color}80` 
            }}
            className="h-full"
          />
        </div>
      </motion.div>
    );
  };
  
  return (
    <div className="absolute inset-x-0 p-4 z-10">
      <div className="max-w-4xl mx-auto flex flex-col space-y-4">
        {/* Top bar with score and level */}
        <div className="flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel px-4 py-2 rounded-lg pointer-events-auto shadow-lg border border-white/10"
          >
            <div className="text-sm text-white/80">Score</div>
            <motion.div 
              key={score}
              initial={{ scale: 1.2, color: "#ffffff" }}
              animate={{ scale: 1, color: "#ffffff" }}
              className="text-xl font-bold"
            >
              {score}
            </motion.div>
          </motion.div>
          
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              dispatch({ type: 'PAUSE_GAME' });
            }}
            className="glass-panel px-4 py-2 rounded-lg pointer-events-auto hover:bg-white/10 transition-colors shadow-lg border border-white/10"
          >
            <div className="text-xl font-bold tracking-wider">PAUSE</div>
          </motion.button>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel px-4 py-2 rounded-lg text-right pointer-events-auto shadow-lg border border-white/10"
          >
            <div className="text-sm text-white/80">Level</div>
            <div className="text-xl font-bold">{state.level}</div>
          </motion.div>
        </div>
        
        {/* Health and energy bars */}
        <div className="flex space-x-4">
          {/* Health bar */}
          <ProgressBar 
            value={player.health} 
            maxValue={player.maxHealth} 
            label="Health" 
            color="#FF5555"
            animate={false}
          />
          
          {/* Energy bar */}
          <ProgressBar 
            value={player.energy} 
            maxValue={player.maxEnergy} 
            label="Energy" 
            color={elementColors[player.currentElement]}
            animate={true}
          />
        </div>
        
        {/* Element power description */}
        <AnimatePresence mode="wait">
          <motion.div
            key={player.currentElement}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.8, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-center text-sm max-w-sm mx-auto"
          >
            {player.currentElement === 'fire' && (
              <span>Fire spirits move quickly and regenerate energy faster.</span>
            )}
            {player.currentElement === 'water' && (
              <span>Water spirits can momentarily float when jumping.</span>
            )}
            {player.currentElement === 'earth' && (
              <span>Earth spirits jump higher but fall faster. More resistant to damage.</span>
            )}
            {player.currentElement === 'air' && (
              <span>Air spirits fall more slowly and can float gracefully.</span>
            )}
            {player.currentElement === 'spirit' && (
              <span>Spirit form is balanced in all attributes.</span>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GameHUD;
