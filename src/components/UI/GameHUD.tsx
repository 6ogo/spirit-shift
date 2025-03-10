
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame, ElementType } from '@/contexts/GameContext';
import { Heart, Battery, Flame, Droplet, Leaf, Wind, Ghost } from 'lucide-react';

const GameHUD: React.FC = () => {
  const { state, dispatch, elementColors, elementNames } = useGame();
  const { player, score } = state;
  
  // Progress bar component
  const ProgressBar: React.FC<{ 
    value: number, 
    maxValue: number, 
    label: string, 
    color: string,
    className?: string,
    animate?: boolean,
    icon?: React.ReactNode
  }> = ({ value, maxValue, label, color, className = "", animate = true, icon }) => {
    const percentage = (value / maxValue) * 100;
    
    return (
      <motion.div 
        initial={{ opacity: 0, width: 0 }}
        animate={{ opacity: 1, width: 'auto' }}
        className={`glass-panel p-2 flex-1 ${className}`}
      >
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-1.5 text-xs text-white/80">
            {icon}
            <span>{label}</span>
          </div>
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

  // Element Button component
  const ElementButton: React.FC<{
    element: ElementType,
    onClick: () => void,
    isActive: boolean,
    position: number
  }> = ({ element, onClick, isActive, position }) => {
    // Get the proper icon based on element
    const getIcon = () => {
      switch(element) {
        case 'fire': return <Flame size={16} className="text-white" />;
        case 'water': return <Droplet size={16} className="text-white" />;
        case 'earth': return <Leaf size={16} className="text-white" />;
        case 'air': return <Wind size={16} className="text-white" />;
        case 'spirit': 
        default: return <Ghost size={16} className="text-white" />;
      }
    };

    return (
      <motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ 
          scale: isActive ? 1.1 : 1, 
          opacity: 1,
          y: [0, -5, 0],
        }}
        transition={{ 
          duration: 0.3, 
          delay: position * 0.1,
          y: {
            repeat: isActive ? Infinity : 0,
            duration: 1.5,
            repeatType: "reverse"
          }
        }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="relative"
      >
        <div 
          className={`w-12 h-12 rounded-full flex items-center justify-center ${isActive ? 'border-2 border-white' : 'opacity-70'}`}
          style={{ 
            backgroundColor: elementColors[element],
            boxShadow: isActive ? `0 0 12px 5px ${elementColors[element]}` : `0 0 8px 2px ${elementColors[element]}40`
          }}
        >
          {getIcon()}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: isActive ? 1 : 0.6, y: 0 }}
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold whitespace-nowrap"
        >
          {elementNames[element]}
        </motion.div>
      </motion.button>
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
            <div className="text-xl font-bold">{state.isTutorialLevel ? "Home" : state.level}</div>
          </motion.div>
        </div>
        
        {/* Health and energy bars - Positioned at the bottom left */}
        <motion.div 
          className="fixed bottom-6 left-6 z-50 flex flex-col space-y-3 w-64"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Health bar */}
          <ProgressBar 
            value={player.health} 
            maxValue={player.maxHealth} 
            label="Health" 
            color="#FF5555"
            animate={false}
            icon={<Heart size={14} className="text-red-500" />}
          />
          
          {/* Energy bar */}
          <ProgressBar 
            value={player.energy} 
            maxValue={player.maxEnergy} 
            label="Energy" 
            color={elementColors[player.currentElement]}
            animate={true}
            icon={<Battery size={14} className="text-yellow-500" />}
          />
        </motion.div>
        
        {/* Element selection buttons at the bottom center */}
        <motion.div 
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex space-x-4 items-end"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ElementButton 
            element="fire" 
            onClick={() => dispatch({ type: 'CHANGE_ELEMENT', payload: 'fire' })}
            isActive={player.currentElement === 'fire'}
            position={1}
          />
          <ElementButton 
            element="water" 
            onClick={() => dispatch({ type: 'CHANGE_ELEMENT', payload: 'water' })}
            isActive={player.currentElement === 'water'}
            position={2}
          />
          <ElementButton 
            element="spirit" 
            onClick={() => dispatch({ type: 'CHANGE_ELEMENT', payload: 'spirit' })}
            isActive={player.currentElement === 'spirit'}
            position={0}
          />
          <ElementButton 
            element="earth" 
            onClick={() => dispatch({ type: 'CHANGE_ELEMENT', payload: 'earth' })}
            isActive={player.currentElement === 'earth'}
            position={3}
          />
          <ElementButton 
            element="air" 
            onClick={() => dispatch({ type: 'CHANGE_ELEMENT', payload: 'air' })}
            isActive={player.currentElement === 'air'}
            position={4}
          />
        </motion.div>
        
        {/* Element power description */}
        <AnimatePresence mode="wait">
          {state.isTutorialLevel && (
            <motion.div
              key={player.currentElement}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.9, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-center text-sm max-w-sm mx-auto bg-black/40 p-3 rounded-lg"
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
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GameHUD;
