
import React, { useEffect, useState } from 'react';
import { useGame, ElementType } from '@/contexts/GameContext';
import { motion, AnimatePresence } from 'framer-motion';

interface PlayerProps {
  width?: number;
  height?: number;
}

const Player: React.FC<PlayerProps> = ({ width = 40, height = 50 }) => {
  const { state, elementColors } = useGame();
  const { player } = state;
  const [isShifting, setIsShifting] = useState(false);
  const [lastElement, setLastElement] = useState<ElementType>(player.currentElement);
  
  // Element shift animation
  useEffect(() => {
    if (player.currentElement !== lastElement) {
      setIsShifting(true);
      const timer = setTimeout(() => {
        setIsShifting(false);
        setLastElement(player.currentElement);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [player.currentElement, lastElement]);
  
  // Element-specific styling
  const getElementStyles = (element: ElementType) => {
    const baseStyles = `rounded-md w-${width} h-${height}`;
    
    switch (element) {
      case 'fire':
        return `${baseStyles} spirit-fire animate-pulse-subtle`;
      case 'water':
        return `${baseStyles} spirit-water`;
      case 'earth':
        return `${baseStyles} spirit-earth`;
      case 'air':
        return `${baseStyles} spirit-air`;
      default:
        return `${baseStyles} bg-gray-800 border border-white/20`;
    }
  };
  
  return (
    <div 
      className="absolute transition-transform"
      style={{ 
        left: player.x, 
        top: player.y,
        transform: `translate(-50%, -100%)` 
      }}
    >
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ 
            scale: isShifting ? [1, 1.2, 1] : 1, 
            opacity: 1 
          }}
          transition={{ 
            duration: 0.5,
            ease: "easeInOut"
          }}
          className={`relative ${getElementStyles(player.currentElement)}`}
        >
          {/* Player eyes */}
          <div className="absolute top-3 left-0 right-0 flex justify-center space-x-3">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          
          {/* Element indicator */}
          {isShifting && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 1], opacity: [0, 0.8, 0] }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 rounded-md"
              style={{ 
                backgroundColor: elementColors[player.currentElement],
                boxShadow: `0 0 20px 5px ${elementColors[player.currentElement]}` 
              }}
            />
          )}
          
          {/* Element particles effect */}
          {player.currentElement !== 'spirit' && (
            <div className="absolute -bottom-2 left-0 right-0 flex justify-center">
              <div 
                className={`w-1 h-1 rounded-full animate-float`}
                style={{ backgroundColor: elementColors[player.currentElement] }}
              />
              <div 
                className={`w-1 h-1 rounded-full animate-float`}
                style={{ 
                  backgroundColor: elementColors[player.currentElement],
                  animationDelay: '0.2s'
                }}
              />
              <div 
                className={`w-1 h-1 rounded-full animate-float`}
                style={{ 
                  backgroundColor: elementColors[player.currentElement],
                  animationDelay: '0.4s'
                }}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Player;
