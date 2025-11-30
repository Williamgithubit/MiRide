import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/MiRide Logo.png';

interface SplashScreenProps {
  onLoadingComplete?: () => void;
  minDisplayTime?: number;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ 
  onLoadingComplete,
  minDisplayTime = 2000 
}) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      onLoadingComplete?.();
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [minDisplayTime, onLoadingComplete]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800"
        >
          <div className="flex flex-col items-center space-y-6">
            {/* Animated logo container */}
            <div className="relative">
              {/* Outer rotating ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute inset-0 w-32 h-32 rounded-full border-4 border-transparent border-t-green-500 border-r-emerald-500"
              />
              
              {/* Inner rotating ring (opposite direction) */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute inset-2 w-28 h-28 rounded-full border-4 border-transparent border-b-green-400 border-l-emerald-400"
              />

              {/* Pulsing glow effect */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 w-32 h-32 rounded-full bg-green-400/20 blur-xl"
              />

              {/* Logo in center */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 20,
                }}
                className="relative w-32 h-32 flex items-center justify-center"
              >
                <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center p-3">
                  <img
                    src={logo}
                    alt="MiRide"
                    className="w-full h-full object-contain"
                  />
                </div>
              </motion.div>
            </div>

            {/* Loading text with dots animation */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                  Loading...
                </span>
                <div className="flex space-x-1">
                  {[0, 1, 2].map((index) => (
                    <motion.div
                      key={index}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 1, 0.3],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: index * 0.2,
                      }}
                      className="w-2 h-2 bg-green-600 rounded-full"
                    />
                  ))}
                </div>
              </div>
              
              {/* Progress bar */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="mt-4 h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 rounded-full"
                style={{ width: '200px' }}
              />
            </motion.div>

            {/* Optional: Loading tips or messages */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-sm text-gray-500 dark:text-gray-400 max-w-xs text-center"
            >
              Preparing your experience...
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;