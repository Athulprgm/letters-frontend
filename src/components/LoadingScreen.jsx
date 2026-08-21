'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGift } from '@fortawesome/free-solid-svg-icons';
import { useSettingsStore } from '../store/settingsStore';

export default function LoadingScreen({ onComplete }) {
  const { settings } = useSettingsStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 1800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const curtainExit = {
    initial: { opacity: 1 },
    exit: { 
      opacity: 0,
      y: -40,
      scale: 1.02,
      transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } 
    }
  };

  return (
    <motion.div
      variants={curtainExit}
      initial="initial"
      exit="exit"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--bg)] will-change-transform px-6 overflow-hidden select-none"
    >
      {/* Ambient Luxury Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-radial from-[var(--accent)]/15 via-transparent to-transparent pointer-events-none animate-pulse blur-3xl rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-radial from-[var(--accent-secondary)]/10 via-transparent to-transparent pointer-events-none animate-pulse blur-3xl rounded-full" />

      {/* Centerpiece */}
      <div className="relative flex items-center justify-center mb-8">
        <motion.svg 
          className="absolute w-40 h-40 md:w-48 md:h-48 text-[var(--accent)] pointer-events-none"
          viewBox="0 0 100 100"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
        >
          <circle 
            cx="50" cy="50" r="46" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1" 
            strokeDasharray="6 4" 
            opacity="0.6"
          />
          <circle 
            cx="50" cy="50" r="42" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="0.5" 
            opacity="0.3"
          />
        </motion.svg>

        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="w-28 h-28 md:w-32 md:h-32 flex items-center justify-center z-10 drop-shadow-xl"
        >
          <img
            src="/logo.png"
            alt={settings.brandName || 'LETTERS'}
            className="w-full h-full object-contain"
          />
        </motion.div>
      </div>

      {/* Premium Typography */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center text-center z-10"
      >
        <h2 className="font-brand-calligraphy text-5xl md:text-6xl font-normal text-[var(--text)] tracking-wide mb-1">
          {settings.brandName && settings.brandName.toUpperCase() === 'LETTERS' ? 'Letters' : (settings.brandName || 'Letters')}
        </h2>
        <p className="text-[10px] tracking-[0.45em] text-[var(--accent-secondary)] uppercase font-bold">
          Bespoke Gifting Atelier • Est. {settings.establishedYear || '2020'}
        </p>
      </motion.div>

    </motion.div>
  );
}
