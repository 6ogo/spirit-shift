
import React from 'react';
import { motion } from 'framer-motion';
import { ElementType, useGame } from '@/contexts/GameContext';

interface SpiritProps {
  element: ElementType;
  x: number;
  y: number;
  onPossess?: () => void;
}

const Spirit: React.FC<SpiritProps> = ({ element, x, y, onPossess }) => {
  const { state, dispatch, elementColors, elementNames } = useGame();
  
  const handleClick = () => {
    // Change to this element
    dispatch({ type: 'CHANGE_ELEMENT', payload: element });
    if (onPossess) onPossess();
  };
  
  // Get element icon/symbol
  const getElementSymbol = () => {
    switch(element) {
      case 'fire': return '🔥';
      case 'water': return '💧';
      case 'earth': return '🌿';
      case 'air': return '💨';
      default: return '✨';
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.1, y: -5 }}
      whileTap={{ scale: 0.95 }}
      className="absolute cursor-pointer"
      style={{ 
        left: x, 
        top: y,
      }}
      onClick={handleClick}
    >
      <div 
        className={`w-14 h-14 rounded-full flex items-center justify-center animate-float`}
        style={{ 
          backgroundColor: elementColors[element],
          boxShadow: `0 0 10px 2px ${elementColors[element]}80`
        }}
      >
        <div className="text-xl font-bold text-white flex flex-col items-center">
          {getElementSymbol()}
        </div>
      </div>
      
      {/* Spirit name label */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 0.8, y: 0 }}
        transition={{ delay: 0.2 }}
        className="absolute left-1/2 -translate-x-1/2 -bottom-6 whitespace-nowrap text-sm font-medium"
      >
        {elementNames[element]}
      </motion.div>
      
      {/* Glowing effect */}
      <motion.div 
        animate={{ 
          opacity: [0.6, 0.2, 0.6], 
          scale: [1, 1.2, 1] 
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 2 
        }}
        className="absolute inset-0 rounded-full -z-10"
        style={{ 
          backgroundColor: elementColors[element],
          filter: 'blur(8px)'
        }}
      />
      
      {/* Attract particles */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{ 
            backgroundColor: elementColors[element],
            boxShadow: `0 0 5px ${elementColors[element]}`
          }}
          initial={{ 
            x: (Math.random() - 0.5) * 50, 
            y: (Math.random() - 0.5) * 50,
            opacity: 0 
          }}
          animate={{ 
            x: 0, 
            y: 0, 
            opacity: [0, 1, 0] 
          }}
          transition={{ 
            duration: 1 + Math.random(), 
            repeat: Infinity, 
            repeatDelay: Math.random() * 2
          }}
        />
      ))}
    </motion.div>
  );
};

export default Spirit;
