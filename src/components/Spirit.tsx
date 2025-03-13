import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ElementType, useGame } from '@/contexts/GameContext';

interface SpiritProps {
  element: ElementType;
  x: number;
  y: number;
  size?: number;
  glowing?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  onPossess?: () => void;
}

const Spirit: React.FC<SpiritProps> = ({ element, x, y, size = 56, glowing = false, clickable = false, onClick, onPossess }) => {
  const { state, dispatch, elementColors, elementNames } = useGame();
  const [isHovered, setIsHovered] = useState(false);
  
  const handleClick = () => {
    // Call the onClick handler if provided
    if (onClick) {
      onClick();
    } else {
      // Change element on click
      dispatch({ type: 'CHANGE_ELEMENT', payload: element });
      if (onPossess) onPossess();
    }
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
      className={`absolute ${clickable ? 'cursor-pointer' : ''}`}
      style={{ 
        left: x, 
        top: y,
        zIndex: 10 // Ensure it's always clickable
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick} // Add direct click handler to the container
    >
      <div 
        className={`rounded-full flex items-center justify-center transition-all duration-300 ${isHovered ? 'shadow-lg' : ''}`}
        style={{ 
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: elementColors[element], 
          boxShadow: glowing || isHovered ? `0 0 15px ${elementColors[element]}` : 'none' 
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
        className="absolute w-full text-center text-xs font-bold text-white pointer-events-none"
      >
        Possess
      </motion.div>
      
      {/* Spirit name label */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 0.9, y: 0 }}
        transition={{ delay: 0.2 }}
        className="absolute left-1/2 -translate-x-1/2 -bottom-6 whitespace-nowrap text-sm font-medium text-white pointer-events-none"
      >
        {elementNames[element]}
      </motion.div>
      
      {/* Glowing effect */}
      <motion.div 
        animate={{ 
          opacity: [0.7, 0.3, 0.7], 
          scale: [1, 1.3, 1] 
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 4,
          ease: "easeInOut" 
        }}
        className="absolute inset-0 rounded-full -z-10 pointer-events-none"
        style={{ 
          backgroundColor: elementColors[element],
          filter: 'blur(8px)'
        }}
      />
      
      {/* Attract particles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
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
            duration: 2 + Math.random(),
            repeat: Infinity, 
            repeatDelay: Math.random() * 3
          }}
        />
      ))}
      
      {/* Element-specific effects */}
      {element === 'fire' && (
        [...Array(3)].map((_, i) => (
          <motion.div
            key={`fire-${i}`}
            className="absolute w-2 h-4 rounded-full pointer-events-none"
            style={{ 
              backgroundColor: '#FF9D5C',
              left: '50%',
              bottom: '60%',
              transform: 'translateX(-50%)'
            }}
            animate={{ 
              y: [-5, -15, -5],
              opacity: [0.8, 0, 0.8],
              width: [6, 2, 6]
            }}
            transition={{ 
              duration: 1.5 + Math.random() * 0.8,
              delay: i * 0.4,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        ))
      )}
      
      {element === 'water' && (
        <motion.div
          className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
          style={{ opacity: 0.7 }}
        >
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ 
              background: `linear-gradient(0deg, ${elementColors.water} 0%, rgba(255,255,255,0.3) 100%)`,
            }}
            animate={{ 
              y: ['0%', '100%', '0%']
            }}
            transition={{ 
              duration: 5,
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