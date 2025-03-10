import React, { useState } from 'react';
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
  const [isHovered, setIsHovered] = useState(false);
  
  const handleClick = () => {
    // Visual and sound feedback before switching
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
      whileHover={{ scale: 1.1, y: -8 }}
      whileTap={{ scale: 0.95 }}
      className="absolute cursor-pointer"
      style={{ 
        left: x, 
        top: y,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Make the entire div clickable by wrapping the content in a button */}
      <button 
        onClick={handleClick}
        className="bg-transparent border-0 p-0 m-0 cursor-pointer focus:outline-none"
        style={{ width: '100%', height: '100%' }}
      >
        <div 
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${isHovered ? 'shadow-lg' : ''}`}
          style={{ 
            backgroundColor: elementColors[element],
            boxShadow: `0 0 ${isHovered ? '15px 5px' : '10px 2px'} ${elementColors[element]}80`
          }}
        >
          <div className="text-xl font-bold text-white flex flex-col items-center">
            {getElementSymbol()}
          </div>
        </div>
        
        {/* Interact prompt */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? -20 : -10 }}
          className="absolute w-full text-center text-xs font-bold text-white"
        >
          Possess
        </motion.div>
        
        {/* Spirit name label */}
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 0.9, y: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute left-1/2 -translate-x-1/2 -bottom-6 whitespace-nowrap text-sm font-medium text-white"
        >
          {elementNames[element]}
        </motion.div>
      </button>
      
      {/* Glowing effect */}
      <motion.div 
        animate={{ 
          opacity: [0.7, 0.3, 0.7], 
          scale: [1, 1.3, 1] 
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 4,  // Slower animation duration
          ease: "easeInOut" 
        }}
        className="absolute inset-0 rounded-full -z-10"
        style={{ 
          backgroundColor: elementColors[element],
          filter: 'blur(8px)'
        }}
      />
      
      {/* Attract particles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{ 
            backgroundColor: elementColors[element],
            boxShadow: `0 0 5px ${elementColors[element]}`
          }}
          initial={{ 
            x: (Math.random() - 0.5) * 70, 
            y: (Math.random() - 0.5) * 70,
            opacity: 0 
          }}
          animate={{ 
            x: 0, 
            y: 0, 
            opacity: [0, 1, 0] 
          }}
          transition={{ 
            duration: 2 + Math.random(),  // Slower animation
            repeat: Infinity, 
            repeatDelay: Math.random() * 3  // Longer delay between animations
          }}
        />
      ))}
      
      {/* Element-specific effects */}
      {element === 'fire' && (
        [...Array(3)].map((_, i) => (
          <motion.div
            key={`fire-${i}`}
            className="absolute w-2 h-4 rounded-full"
            style={{ 
              backgroundColor: '#FF9D5C',
              left: '50%',
              bottom: '60%',
              translateX: '-50%'
            }}
            animate={{ 
              y: [-5, -15, -5],
              opacity: [0.8, 0, 0.8],
              width: [6, 2, 6]
            }}
            transition={{ 
              duration: 1.5 + Math.random() * 0.8,  // Slower fire animation
              delay: i * 0.4,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        ))
      )}
      
      {element === 'water' && (
        <motion.div
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{ opacity: 0.7 }}
        >
          <motion.div
            className="absolute inset-0"
            style={{ 
              background: `linear-gradient(0deg, ${elementColors.water} 0%, rgba(255,255,255,0.3) 100%)`,
            }}
            animate={{ 
              y: ['0%', '100%', '0%']
            }}
            transition={{ 
              duration: 5,  // Much slower water animation
              ease: "easeInOut",
              repeat: Infinity,
            }}
          />
        </motion.div>
      )}
    </motion.div>
  );
};

export default Spirit;