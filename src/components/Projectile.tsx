import React from 'react';
import { motion } from 'framer-motion';
import { useGame, ElementType } from '@/contexts/GameContext';

interface ProjectileProps {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  element: ElementType;
  velocityX: number;
}

const Projectile: React.FC<ProjectileProps> = ({
  id,
  x,
  y,
  width,
  height,
  element,
  velocityX
}) => {
  const { elementColors } = useGame();
  const direction = velocityX > 0 ? 'right' : 'left';
  
  // Element-specific styling and effects
  const getProjectileStyles = () => {
    switch (element) {
      case 'fire':
        return {
          className: "rounded-full",
          background: `radial-gradient(circle, #FF9D5C 0%, ${elementColors.fire} 70%)`,
          boxShadow: `0 0 10px 2px ${elementColors.fire}`,
          trailColor: "rgba(255, 157, 92, 0.6)",
        };
      case 'water':
        return {
          className: "rounded-full",
          background: `radial-gradient(circle, #A0D8FF 0%, ${elementColors.water} 70%)`,
          boxShadow: `0 0 8px 1px ${elementColors.water}`,
          trailColor: "rgba(160, 216, 255, 0.5)",
        };
      case 'earth':
        return {
          className: "rounded",
          background: `radial-gradient(circle, #A5D6A7 0%, ${elementColors.earth} 70%)`,
          boxShadow: `0 0 6px 1px ${elementColors.earth}`,
          trailColor: "rgba(165, 214, 167, 0.4)",
        };
      case 'air':
        return {
          className: "rounded-full",
          background: `radial-gradient(circle, #D0DFF9 0%, ${elementColors.air} 70%)`,
          boxShadow: `0 0 12px 3px ${elementColors.air}`,
          trailColor: "rgba(208, 223, 249, 0.7)",
        };
      default:
        return {
          className: "rounded",
          background: `radial-gradient(circle, #CCCCCC 0%, ${elementColors.spirit} 70%)`,
          boxShadow: `0 0 5px 1px ${elementColors.spirit}`,
          trailColor: "rgba(204, 204, 204, 0.3)",
        };
    }
  };
  
  const styles = getProjectileStyles();
  
  return (
    <div 
      className="absolute pointer-events-none"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Motion trail */}
      <motion.div
        className="absolute"
        style={{
          width: width * 2.5,
          height: height,
          backgroundColor: styles.trailColor,
          borderRadius: element === 'earth' ? '2px' : '50%',
          filter: 'blur(4px)',
          opacity: 0.7,
          left: direction === 'right' ? -width * 2 : width,
        }}
        animate={{
          opacity: [0.7, 0]
        }}
        transition={{
          duration: 0.3,
          ease: "easeOut"
        }}
      />
      
      {/* Main projectile */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          rotate: element === 'earth' ? 0 : 360
        }}
        transition={{
          rotate: {
            duration: 0.8,
            repeat: Infinity,
            ease: "linear"
          },
          scale: { duration: 0.2 }
        }}
        className={styles.className}
        style={{
          width,
          height,
          background: styles.background,
          boxShadow: styles.boxShadow,
        }}
      />
      
      {/* Element-specific effects */}
      {element === 'fire' && (
        <motion.div
          className="absolute inset-0"
          style={{ borderRadius: '50%' }}
          animate={{
            boxShadow: ['0 0 5px 2px rgba(255,0,0,0.5)', '0 0 10px 4px rgba(255,0,0,0.3)', '0 0 5px 2px rgba(255,0,0,0.5)']
          }}
          transition={{
            duration: 0.7,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
      
      {element === 'water' && (
        [...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-blue-300/30"
            style={{
              width: 2 + Math.random() * 2,
              height: 2 + Math.random() * 2,
              top: '50%',
              left: '50%',
            }}
            animate={{
              x: [0, (Math.random() - 0.5) * 15],
              y: [0, (Math.random() - 0.5) * 15],
              opacity: [0.8, 0]
            }}
            transition={{
              duration: 0.5 + Math.random() * 0.3,
              repeat: Infinity,
              repeatDelay: Math.random() * 0.2
            }}
          />
        ))
      )}
      
      {element === 'air' && (
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.6, 0.2, 0.6],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            background: `radial-gradient(circle, ${elementColors.air}50 0%, transparent 70%)`,
          }}
        />
      )}
    </div>
  );
};

export default Projectile;