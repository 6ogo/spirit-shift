
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
  const [facingDirection, setFacingDirection] = useState('right');
  
  // Track player direction for animation
  useEffect(() => {
    if (player.velocityX > 0) {
      setFacingDirection('right');
    } else if (player.velocityX < 0) {
      setFacingDirection('left');
    }
  }, [player.velocityX]);
  
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
  
  // Create particle effects based on element
  const Particles = () => {
    const particleCount = 5;
    const element = player.currentElement;
    if (element === 'spirit') return null;
    
    return (
      <>
        {[...Array(particleCount)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: 0, 
              y: 0, 
              opacity: 0.8, 
              scale: Math.random() * 0.5 + 0.5 
            }}
            animate={{ 
              x: Math.random() * 40 - 20, 
              y: Math.random() * -30 - 10, 
              opacity: 0,
              scale: 0
            }}
            transition={{ 
              duration: Math.random() + 0.5, 
              repeat: Infinity, 
              repeatDelay: Math.random() * 0.5 
            }}
            className="absolute rounded-full"
            style={{ 
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              backgroundColor: elementColors[element],
              left: '50%',
              bottom: 0,
              transform: 'translateX(-50%)'
            }}
          />
        ))}
      </>
    );
  };
  
  // Jumping animation
  const getJumpAnimation = () => {
    if (player.isJumping) {
      return { scale: [1, 1.05, 1], y: [0, -5, 0] };
    }
    return {};
  };
  
  return (
    <div 
      className="absolute transition-transform"
      style={{ 
        left: player.x, 
        top: player.y,
        transform: `translate(-50%, -100%) scaleX(${facingDirection === 'left' ? -1 : 1})` 
      }}
    >
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ 
            scale: isShifting ? [1, 1.2, 1] : 1, 
            opacity: 1,
            ...getJumpAnimation()
          }}
          transition={{ 
            duration: 0.5,
            ease: "easeInOut"
          }}
          className={`relative ${getElementStyles(player.currentElement)}`}
        >
          {/* Player eyes */}
          <div className="absolute top-3 left-0 right-0 flex justify-center space-x-3 pointer-events-none">
            <motion.div 
              animate={{ scale: player.isJumping ? [1, 1.2, 1] : 1 }}
              className="w-2 h-2 bg-white rounded-full"
            />
            <motion.div 
              animate={{ scale: player.isJumping ? [1, 1.2, 1] : 1 }}
              transition={{ delay: 0.1 }}
              className="w-2 h-2 bg-white rounded-full"
            />
          </div>
          
          {/* Element indicator */}
          {isShifting && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 1], opacity: [0, 0.8, 0] }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 rounded-md pointer-events-none"
              style={{ 
                backgroundColor: elementColors[player.currentElement],
                boxShadow: `0 0 20px 5px ${elementColors[player.currentElement]}` 
              }}
            />
          )}
          
          {/* Element particles effect */}
          <Particles />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Player;
