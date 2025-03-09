
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
  const { state, dispatch, elementColors } = useGame();
  
  const handleClick = () => {
    // Change to this element
    dispatch({ type: 'CHANGE_ELEMENT', payload: element });
    if (onPossess) onPossess();
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="absolute cursor-pointer"
      style={{ 
        left: x, 
        top: y,
      }}
      onClick={handleClick}
    >
      <div 
        className={`w-12 h-12 rounded-full flex items-center justify-center animate-float`}
        style={{ 
          backgroundColor: elementColors[element],
          boxShadow: `0 0 10px 2px ${elementColors[element]}80`
        }}
      >
        <div className="text-xs font-bold text-white">
          {element.charAt(0).toUpperCase()}
        </div>
      </div>
      
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
    </motion.div>
  );
};

export default Spirit;
