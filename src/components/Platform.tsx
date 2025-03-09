
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
    </motion.div>
  );
};

export default Platform;
