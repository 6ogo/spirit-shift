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
  const [lastPosition, setLastPosition] = useState({ x: player.x, y: player.y });
  
  // Use the facingDirection from game state
  const facingDirection = player.facingDirection;
  
  // Log position changes for debugging
  useEffect(() => {
    if (Math.abs(lastPosition.x - player.x) > 1 || Math.abs(lastPosition.y - player.y) > 1) {
      console.log(`Player moved: (${lastPosition.x.toFixed(1)}, ${lastPosition.y.toFixed(1)}) -> (${player.x.toFixed(1)}, ${player.y.toFixed(1)})`);
      setLastPosition({ x: player.x, y: player.y });
    }
  }, [player.x, player.y]);
  
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
    const baseStyles = `rounded-md`;
    
    switch (element) {
      case 'fire':
        return `${baseStyles} spirit-fire animate-pulse-subtle`;
      case 'water':
        return `${baseStyles} spirit-water animate-float`;
      case 'earth':
        return `${baseStyles} spirit-earth`;
      case 'air':
        return `${baseStyles} spirit-air animate-float`;
      default:
        return `${baseStyles} bg-gray-800 border border-white/20`;
    }
  };
  
  // Create particle effects based on element
  const Particles = () => {
    const particleCount = 8;
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
              x: Math.random() * 60 - 30,
              y: Math.random() * -40 - 10, 
              opacity: 0,
              scale: 0
            }}
            transition={{ 
              duration: Math.random() * 1.5 + 0.7,
              repeat: Infinity, 
              repeatDelay: Math.random() * 0.3 
            }}
            className="absolute rounded-full"
            style={{ 
              width: Math.random() * 5 + 2,
              height: Math.random() * 5 + 2,
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

  // Add movement indicators
  const MovementIndicator = () => {
    if (!player.isMovingLeft && !player.isMovingRight) return null;
    
    const direction = player.isMovingLeft ? 'left' : 'right';
    
    return (
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 opacity-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        <div className="relative">
          <div 
            className="absolute w-20 h-1 rounded-full"
            style={{
              backgroundColor: elementColors[player.currentElement],
              bottom: -5,
              left: direction === 'left' ? '-20px' : '0',
              transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)'
            }}
          />
        </div>
      </motion.div>
    );
  };
  
  return (
    <div 
      className="absolute will-change-transform hardware-accelerated"
      style={{ 
        left: player.x + "px", 
        top: player.y + "px",
        transform: `translate3d(-50%, -100%, 0) scaleX(${facingDirection === 'left' ? -1 : 1})`,
        filter: isShifting ? 'blur(3px)' : 'none',
        transition: 'filter 0.3s ease', 
        zIndex: 20
      }}
      data-testid="player-character"
    >
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ 
            scale: isShifting ? [1, 1.2, 1] : 1, 
            opacity: 1,
            ...getJumpAnimation(),
            height: player.height,
            width: player.isDucking ? player.width * 1.2 : player.width,
          }}
          transition={{ 
            duration: 0.5,
            ease: "easeInOut"
          }}
          className={`relative ${getElementStyles(player.currentElement)}`}
          style={{
            width: player.isDucking ? player.width * 1.2 : player.width,
            height: player.height
          }}
        >
          {/* Player eyes */}
          <div 
            className="absolute flex justify-center space-x-3 pointer-events-none"
            style={{ 
              top: player.isDucking ? '25%' : '30%',
              left: 0,
              right: 0
            }}
          >
            <motion.div 
              animate={{ 
                scale: player.isJumping ? [1, 1.2, 1] : 1,
                y: player.isDucking ? 1 : 0 
              }}
              className="w-2 h-2 bg-white rounded-full"
            />
            <motion.div 
              animate={{ 
                scale: player.isJumping ? [1, 1.2, 1] : 1, 
                y: player.isDucking ? 1 : 0 
              }}
              transition={{ delay: 0.1 }}
              className="w-2 h-2 bg-white rounded-full"
            />
          </div>
          
          {/* Element indicator */}
          {isShifting && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.8, 1], opacity: [0, 0.9, 0] }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 rounded-md pointer-events-none"
              style={{ 
                backgroundColor: elementColors[player.currentElement],
                boxShadow: `0 0 25px 8px ${elementColors[player.currentElement]}` 
              }}
            />
          )}
          
          {/* Movement effects for different elements */}
          {(player.currentElement === 'fire' || player.currentElement === 'air') && 
            Math.abs(player.velocityX) > 1 && (
            <motion.div
              className="absolute -z-10 h-full w-full opacity-50"
              animate={{
                opacity: [0.7, 0, 0],
                x: facingDirection === 'left' ? [0, 15, 30] : [0, -15, -30],
                scale: [1, 0.8, 0.6]
              }}
              transition={{
                duration: 0.3,
                ease: "easeOut",
                repeat: Infinity,
                repeatType: "loop"
              }}
              style={{
                backgroundColor: elementColors[player.currentElement],
                borderRadius: "inherit",
                filter: `blur(${player.currentElement === 'fire' ? '8px' : '5px'})`
              }}
            />
          )}
          
          {/* Small ripple for water element */}
          {player.currentElement === 'water' && (player.isMovingLeft || player.isMovingRight) && (
            <motion.div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-2 rounded-full"
              animate={{
                scaleX: [1, 1.5, 0.8],
                opacity: [0, 0.5, 0]
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                repeatType: "loop"
              }}
              style={{
                backgroundColor: elementColors.water,
                filter: "blur(2px)"
              }}
            />
          )}
          
          {/* Ground impact for earth element */}
          {player.currentElement === 'earth' && !player.isJumping && player.velocityY > 10 && (
            <motion.div
              className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-16 h-2"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: [0, 0.8, 0], scale: [0.5, 1.5, 0.5] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                backgroundColor: elementColors.earth,
                borderRadius: "50%",
                filter: "blur(3px)"
              }}
            />
          )}
          
          {/* Ducking effect */}
          {player.isDucking && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-1.5 opacity-50"
              initial={{ opacity: 0, scaleX: 0.5 }}
              animate={{ opacity: 0.5, scaleX: 1 }}
              exit={{ opacity: 0, scaleX: 0.5 }}
              style={{
                backgroundColor: elementColors[player.currentElement],
                borderRadius: "0 0 4px 4px",
              }}
            />
          )}
          
          {/* Movement indicator (shows current movement direction) */}
          <MovementIndicator />
          
          {/* Element particles effect */}
          <Particles />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Player;
