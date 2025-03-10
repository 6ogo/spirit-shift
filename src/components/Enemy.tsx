import React from 'react';
import { motion } from 'framer-motion';
import { useGame, ElementType } from '@/contexts/GameContext';

interface EnemyProps {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  element: ElementType;
  direction: 'left' | 'right';
}

const Enemy: React.FC<EnemyProps> = ({ 
  id, 
  x, 
  y, 
  width, 
  height, 
  health, 
  maxHealth, 
  element, 
  direction 
}) => {
  const { elementColors, elementNames } = useGame();
  
  // Element-specific styling
  const getElementStyles = () => {
    switch (element) {
      case 'fire':
        return 'bg-gradient-to-b from-red-600 to-red-700 border-red-500';
      case 'water':
        return 'bg-gradient-to-b from-blue-500 to-blue-600 border-blue-400';
      case 'earth':
        return 'bg-gradient-to-b from-green-600 to-green-700 border-green-500';
      case 'air':
        return 'bg-gradient-to-b from-purple-500 to-indigo-600 border-purple-400';
      default:
        return 'bg-gradient-to-b from-gray-700 to-gray-800 border-gray-600';
    }
  };
  
  // Element-specific particle effects
  const ElementEffect = () => {
    switch (element) {
      case 'fire':
        return (
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-4 bg-orange-400 rounded-full opacity-70"
                style={{ 
                  left: `${10 + Math.random() * 80}%`, 
                  bottom: '0%',
                }}
                animate={{ 
                  y: -10 - Math.random() * 5,
                  opacity: [0.7, 0.2, 0],
                  width: [3, 2, 1],
                }}
                transition={{ 
                  duration: 0.8 + Math.random() * 0.5,
                  repeat: Infinity,
                  repeatDelay: Math.random()
                }}
              />
            ))}
          </div>
        );
      case 'water':
        return (
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent"
              animate={{ 
                y: [0, 3, 0],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            {/* Drip effect */}
            {[...Array(2)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-blue-300/60"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  bottom: '0%'
                }}
                animate={{
                  y: [0, height/2],
                  opacity: [0, 0.7, 0]
                }}
                transition={{
                  duration: 1 + Math.random(),
                  repeat: Infinity,
                  delay: i * 0.7
                }}
              />
            ))}
          </div>
        );
      case 'earth':
        return (
          <div className="absolute inset-0 overflow-hidden">
            {/* Small rock particles */}
            {[...Array(4)].map((_, i) => (
              <div 
                key={i}
                className="absolute w-1 h-1 bg-green-200 rounded-full"
                style={{ 
                  left: `${5 + Math.random() * 90}%`, 
                  top: `${Math.random() * 100}%`,
                  opacity: 0.3 + Math.random() * 0.4
                }}
              />
            ))}
          </div>
        );
      case 'air':
        return (
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0"
              animate={{ 
                backgroundPositionX: ['0%', '100%'],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Wind effect */}
            {[...Array(2)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-0.5 bg-purple-300/30"
                style={{
                  width: 10 + Math.random() * 15,
                  top: `${Math.random() * 100}%`,
                  left: direction === 'right' ? '0%' : '80%'
                }}
                animate={{
                  x: direction === 'right' ? [0, width] : [0, -width],
                  opacity: [0, 0.5, 0]
                }}
                transition={{
                  duration: 1 + Math.random(),
                  repeat: Infinity,
                  delay: i * 0.5
                }}
              />
            ))}
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="absolute"
      style={{ 
        left: x, 
        top: y,
        transform: `translate(-50%, -100%) scaleX(${direction === 'left' ? -1 : 1})`,
      }}
    >
      <div 
        className={`relative rounded-md border ${getElementStyles()}`}
        style={{
          width,
          height,
          boxShadow: `0 0 10px ${elementColors[element]}80`,
        }}
      >
        {/* Enemy eyes */}
        <div className="absolute top-1/4 left-0 right-0 flex justify-center space-x-3 pointer-events-none">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        </div>
        
        {/* Enemy mouth */}
        <div className="absolute top-1/2 left-0 right-0 flex justify-center">
          <div className="w-4 h-1 bg-gray-800 rounded-full"></div>
        </div>
        
        {/* Health bar */}
        <div className="absolute -top-4 left-0 right-0 h-1.5 bg-black/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-500"
            style={{ width: `${(health / maxHealth) * 100}%` }}
          />
        </div>
        
        {/* Element icon */}
        <div 
          className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-black/50 px-1 py-0.5 rounded text-white"
        >
          {elementNames[element]}
        </div>
        
        {/* Element effects */}
        <ElementEffect />
      </div>
    </motion.div>
  );
};

export default Enemy;