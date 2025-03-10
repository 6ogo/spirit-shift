import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import { Play, Info, Volume2, VolumeX, Settings } from 'lucide-react';

const MainMenu: React.FC = () => {
  const { dispatch, elementColors } = useGame();
  const [showInfo, setShowInfo] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isButtonPressed, setIsButtonPressed] = useState(false);
  
  // Element icons that float in the background
  const ElementIcon = ({ element, x, y, delay }: { element: string, x: number, y: number, delay: number }) => (
    <motion.div
      className="absolute"
      style={{ left: `${x}%`, top: `${y}%` }}
      animate={{
        y: [0, -15, 0],
        opacity: [0.6, 0.9, 0.6],
      }}
      transition={{
        repeat: Infinity,
        duration: 3,
        delay: delay,
        ease: "easeInOut"
      }}
    >
      <div 
        className="w-12 h-12 rounded-full"
        style={{ 
          backgroundColor: elementColors[element as any],
          boxShadow: `0 0 15px 5px ${elementColors[element as any]}40` 
        }}
      />
    </motion.div>
  );

  const GameInfo = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      onClick={() => setShowInfo(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-panel max-w-2xl p-8 w-full rounded-xl overflow-y-auto max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-3xl font-bold mb-4 text-gradient">The Legend of Spirit Shift</h2>
        
        <div className="space-y-4 text-left">
          <p>In the forgotten realm of Elysium, a world once in perfect harmony, the four elemental forces have fallen into chaos.</p>
          
          <p>You are the Last Spirit, an ethereal being with the rare gift of possession. Only you can restore balance by wielding the powers of each element - commanding the scorching fury of fire, the fluid grace of water, the steadfast strength of earth, and the swift agility of air.</p>
          
          <p>Journey through procedurally generated biomes, each dominated by an elemental influence. Discover spirits to possess, each granting unique abilities that will help you overcome the corrupted guardians that now plague the land.</p>
          
          <div className="my-6 space-y-2">
            <h3 className="text-xl font-bold">Elemental Powers:</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><span className="font-bold text-red-400">Fire:</span> Unleash devastating attacks and burn through obstacles.</li>
              <li><span className="font-bold text-blue-400">Water:</span> Flow through narrow passages and extinguish flames.</li>
              <li><span className="font-bold text-green-400">Earth:</span> Withstand powerful blows and move heavy objects.</li>
              <li><span className="font-bold text-purple-400">Air:</span> Float gracefully and reach great heights.</li>
            </ul>
          </div>
          
          <p>Master the art of possession, switching between elements with strategic timing to overcome the challenges that lie ahead. Your journey will not be easy, but the fate of Elysium rests in your spectral hands.</p>
        </div>
        
        <div className="mt-6 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 bg-white text-black rounded-full font-bold"
            onClick={() => setShowInfo(false)}
          >
            Close
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
  
  const handlePlayGame = () => {
    setIsButtonPressed(true);
    // Add a small delay to allow the button animation to complete
    setTimeout(() => {
      dispatch({ type: 'START_GAME' });
    }, 300);
  };
  
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-black z-0">
        <div className="absolute inset-0 opacity-20" 
          style={{
            backgroundSize: '20px 20px',
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          }}
        />
      </div>
      
      {/* Floating element icons */}
      <ElementIcon element="fire" x={15} y={30} delay={0} />
      <ElementIcon element="water" x={85} y={40} delay={0.5} />
      <ElementIcon element="earth" x={30} y={70} delay={1} />
      <ElementIcon element="air" x={70} y={20} delay={1.5} />
      
      {/* Game title and menu */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-12"
        >
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold tracking-tighter text-gradient">
            SPIRIT SHIFT
          </h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-4 text-lg sm:text-xl text-white/70"
          >
            Possess. Adapt. Conquer.
          </motion.p>
        </motion.div>
        
        <div className="flex flex-col gap-4 items-center">
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 0 20px 5px rgba(147, 51, 234, 0.5)"
            }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-xl font-bold shadow-lg shadow-purple-600/20 relative overflow-hidden group"
            onClick={handlePlayGame}
            disabled={isButtonPressed}
          >
            <motion.span 
              className="absolute inset-0 bg-white/20"
              initial={{ x: "-100%", opacity: 0 }}
              animate={isButtonPressed ? { x: "100%", opacity: 0.3 } : { x: "-100%", opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
            <Play size={24} />
            <span className="relative z-10">Play Game</span>
            
            {/* Pulsing effect around button */}
            <motion.span
              className="absolute inset-0 rounded-full"
              animate={{ 
                boxShadow: ["0 0 0px 0px rgba(147, 51, 234, 0)", "0 0 15px 2px rgba(147, 51, 234, 0.5)", "0 0 0px 0px rgba(147, 51, 234, 0)"]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "loop"
              }}
            />
          </motion.button>
          
          <div className="flex gap-4 mt-6">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="glass-panel p-3 rounded-full"
              onClick={() => setShowInfo(true)}
            >
              <Info size={24} />
            </motion.button>
            
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="glass-panel p-3 rounded-full"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </motion.button>
            
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="glass-panel p-3 rounded-full"
            >
              <Settings size={24} />
            </motion.button>
          </div>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-8 text-sm text-white/60"
        >
          © 2023 Spirit Shift | Use arrow keys or WASD to move | Space to jump | 1-5 to change spirits
        </motion.div>
      </div>
      
      {/* Game information modal */}
      <AnimatePresence>
        {showInfo && <GameInfo />}
      </AnimatePresence>
    </div>
  );
};

export default MainMenu;