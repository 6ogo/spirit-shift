
import React from 'react';
import { motion } from 'framer-motion';
import { useGame, ElementType } from '@/contexts/GameContext';

const GameHUD: React.FC = () => {
  const { state, dispatch, elementColors, elementNames } = useGame();
  const { player, score } = state;
  
  // Element selection icons
  const ElementIcon: React.FC<{ element: ElementType, index: number }> = ({ element, index }) => {
    const isActive = player.currentElement === element;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`relative w-12 h-12 rounded-full flex items-center justify-center ${isActive ? 'scale-110 z-10' : 'opacity-70'} transition-all button-hover cursor-pointer`}
        style={{ 
          backgroundColor: elementColors[element],
          boxShadow: isActive ? `0 0 10px 2px ${elementColors[element]}` : 'none'
        }}
        onClick={() => dispatch({ type: 'CHANGE_ELEMENT', payload: element })}
      >
        <span className="text-sm font-bold">
          {elementNames[element].charAt(0)}
        </span>
        
        {isActive && (
          <motion.div
            layoutId="active-element"
            className="absolute inset-0 rounded-full border-2 border-white"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}
        
        <div className="absolute -bottom-5 text-xs whitespace-nowrap text-center opacity-80">
          {elementNames[element]}
        </div>
      </motion.div>
    );
  };
  
  // Progress bar component
  const ProgressBar: React.FC<{ 
    value: number, 
    maxValue: number, 
    label: string, 
    color: string,
    className?: string
  }> = ({ value, maxValue, label, color, className = "" }) => (
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
          initial={{ width: '100%' }}
          animate={{ width: `${(value / maxValue) * 100}%` }}
          style={{ backgroundColor: color }}
          className="h-full"
        />
      </div>
    </motion.div>
  );
  
  return (
    <div className="absolute inset-x-0 p-4 z-10 pointer-events-none">
      <div className="max-w-4xl mx-auto flex flex-col space-y-4">
        {/* Top bar with score and level */}
        <div className="flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel px-4 py-2 rounded-lg pointer-events-auto"
          >
            <div className="text-sm text-white/80">Score</div>
            <div className="text-xl font-bold">{score}</div>
          </motion.div>
          
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => dispatch({ type: 'PAUSE_GAME' })}
            className="glass-panel px-4 py-2 rounded-lg pointer-events-auto hover:bg-white/10 transition-colors"
          >
            <div className="text-xl font-bold tracking-wider">PAUSE</div>
          </motion.button>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel px-4 py-2 rounded-lg text-right pointer-events-auto"
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
          />
          
          {/* Energy bar */}
          <ProgressBar 
            value={player.energy} 
            maxValue={player.maxEnergy} 
            label="Energy" 
            color={elementColors[player.currentElement]} 
          />
        </div>
        
        {/* Element selection */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center space-x-6 py-2 pointer-events-auto"
        >
          {state.availableElements.map((element, index) => (
            <ElementIcon key={element} element={element} index={index} />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default GameHUD;
