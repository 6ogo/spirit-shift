
import React from 'react';
import { motion } from 'framer-motion';
import { ElementType } from '@/contexts/GameContext';

interface PlatformProps {
  x: number;
  y: number;
  width: number;
  height?: number;
  element?: ElementType;
  canPassThrough?: boolean;
}

const Platform: React.FC<PlatformProps> = ({ 
  x, 
  y, 
  width, 
  height = 20,
  element = 'spirit',
  canPassThrough = true
}) => {
  // Element-specific platform styling
  const getElementStyles = () => {
    switch (element) {
      case 'fire':
        return 'bg-gradient-to-r from-red-800 to-red-600 border-red-500';
      case 'water':
        return 'bg-gradient-to-r from-blue-800 to-blue-500 border-blue-400';
      case 'earth':
        return 'bg-gradient-to-r from-green-800 to-green-600 border-green-500';
      case 'air':
        return 'bg-gradient-to-r from-purple-800 to-indigo-600 border-purple-400';
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
            <div className="absolute inset-0 bg-gradient-to-t from-transparent to-red-500/10"></div>
          </div>
        );
      case 'water':
        return (
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20"
              animate={{ 
                backgroundPositionX: ['0%', '100%', '0%'],
              }}
              transition={{ 
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            {/* Bubbles effect */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-blue-300/60"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  bottom: '0%'
                }}
                animate={{
                  y: [-10, -height],
                  x: [0, (Math.random() - 0.5) * 10],
                  opacity: [0, 0.7, 0]
                }}
                transition={{
                  duration: 2 + Math.random(),
                  repeat: Infinity,
                  delay: i * 1.5
                }}
              />
            ))}
          </div>
        );
      case 'earth':
        return (
          <div className="absolute inset-0 overflow-hidden">
            {/* Small grass-like elements on top */}
            <div className="absolute inset-x-0 top-0 h-2 flex items-end justify-around">
              {[...Array(Math.floor(width / 15))].map((_, i) => (
                <div 
                  key={i}
                  className="h-1.5 w-1 bg-green-400 rounded-t-full"
                  style={{
                    height: `${0.3 + Math.random() * 0.7}rem`,
                    marginLeft: `${Math.random() * 0.5}rem`
                  }}
                />
              ))}
            </div>
            
            {/* Small rocks/minerals */}
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
            <div className="absolute inset-0 bg-gradient-to-b from-green-900/10 to-transparent"></div>
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
            
            {/* Wind effect */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-0.5 bg-purple-300/40"
                style={{
                  width: 20 + Math.random() * 30,
                  top: `${Math.random() * 100}%`,
                  left: '-10%'
                }}
                animate={{
                  x: [0, width + 20],
                  opacity: [0, 0.7, 0]
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`absolute rounded-md border ${getElementStyles()}`}
      style={{
        left: x,
        top: y,
        width,
        height,
        borderStyle: canPassThrough ? 'dashed' : 'solid', // Visual cue for pass-through platforms
        opacity: canPassThrough ? 0.85 : 1, // Solid platforms are more opaque
      }}
    >
      {/* Pass-through indicator */}
      {canPassThrough && (
        <div className="absolute -top-4 left-0 right-0 flex justify-center">
          <motion.div
            className="text-xs px-1 rounded-sm bg-white/20 backdrop-blur-sm text-white"
            animate={{ y: [0, -3, 0]}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ↑↓
          </motion.div>
        </div>
      )}
      
      {/* Platform surface detail */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 rounded-t-md"></div>
      
      {/* Platform bottom shadow */}
      <div className="absolute -bottom-2 left-0 right-0 h-2 rounded-md opacity-50"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)',
          filter: 'blur(2px)'
        }}
      ></div>
      
      {/* Element-specific effects */}
      <ElementEffect />
    </motion.div>
  );
};

export default Platform;
