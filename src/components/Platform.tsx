
import React from 'react';
import { motion } from 'framer-motion';
import { ElementType } from '@/contexts/GameContext';

interface PlatformProps {
  x: number;
  y: number;
  width: number;
  height?: number;
  element?: ElementType;
}

const Platform: React.FC<PlatformProps> = ({ 
  x, 
  y, 
  width, 
  height = 20,
  element = 'spirit'
}) => {
  // Element-specific platform styling
  const getElementStyles = () => {
    switch (element) {
      case 'fire':
        return 'bg-gradient-to-r from-red-800 to-red-600 border-red-500';
      case 'water':
        return 'bg-gradient-to-r from-blue-800 to-blue-600 border-blue-400';
      case 'earth':
        return 'bg-gradient-to-r from-green-800 to-green-600 border-green-500';
      case 'air':
        return 'bg-gradient-to-r from-purple-800 to-purple-600 border-purple-400';
      default:
        return 'bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600';
    }
  };
  
  // Element-specific effects
  const ElementEffect = () => {
    switch (element) {
      case 'fire':
        return (
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-6 bg-orange-500 rounded-full opacity-70"
                style={{ 
                  left: `${10 + Math.random() * 80}%`, 
                  bottom: '0%',
                }}
                initial={{ y: 0 }}
                animate={{ 
                  y: -20 - Math.random() * 10,
                  opacity: [0.7, 0.2, 0],
                  width: [8, 4, 1],
                }}
                transition={{ 
                  duration: 1 + Math.random(),
                  repeat: Infinity,
                  repeatDelay: Math.random() * 2
                }}
              />
            ))}
          </div>
        );
      case 'water':
        return (
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10"
              animate={{ 
                backgroundPositionX: ['0%', '100%', '0%'],
              }}
              transition={{ 
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </div>
        );
      case 'earth':
        return (
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i}
                className="absolute w-1 h-1 bg-green-300 rounded-full"
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
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`absolute rounded-md border ${getElementStyles()}`}
      style={{
        left: x,
        top: y,
        width,
        height,
      }}
    >
      {/* Platform surface detail */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 rounded-t-md"></div>
      
      {/* Element-specific effects */}
      <ElementEffect />
    </motion.div>
  );
};

export default Platform;
