'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * The "Perfect" Luxury Preloader.
 * Uses advanced CSS masking for a flawless ink-flow text reveal,
 * and the golden standard cubic-bezier split-screen exit.
 */
export default function Preloader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    // Fast dismissal for optimized loading (800ms instead of 2.5s)
    const dismissTimer = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => {
      document.body.style.overflow = '';
      clearTimeout(dismissTimer);
    };
  }, []);

  useEffect(() => {
    if (!loading) {
      document.body.style.overflow = '';
    }
  }, [loading]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="letters-perfect-preloader"
          exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
          className="fixed inset-0 z-[999999] w-screen h-screen flex flex-col items-center justify-center bg-[#FAF7F0] select-none pointer-events-auto"
        >
          {/* Central Content Container */}
          <motion.div 
            exit={{ opacity: 0, scale: 0.95, filter: "blur(5px)", transition: { duration: 0.6, ease: "easeOut" } }}
            className="relative z-10 flex flex-col items-center justify-center gap-8"
          >
            {/* Flawless Ink-Flow Mask Reveal */}
            <div className="relative overflow-visible px-4 py-2">
              <motion.div
                initial={{ backgroundPosition: "200% 0" }}
                animate={{ backgroundPosition: "0% 0" }}
                transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
                className="text-[65px] md:text-[90px] font-normal text-[#1A2417] leading-none tracking-tight pb-2"
                style={{ 
                  fontFamily: "'Alex Brush', 'Pinyon Script', 'Great Vibes', cursive",
                  WebkitMaskImage: "linear-gradient(to right, black 45%, rgba(0,0,0,0.2) 55%, transparent 65%)",
                  WebkitMaskSize: "300% 100%",
                  WebkitMaskRepeat: "no-repeat"
                }}
              >
                Letters
              </motion.div>
            </div>

            {/* Micro-Progress Indicator */}
            <div className="flex flex-col items-center gap-3 opacity-80">
              <div className="w-10 h-[1px] bg-[#E8DED0] relative overflow-hidden">
                <motion.div
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
                  className="absolute inset-0 bg-[#CD8632] h-full"
                />
              </div>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-[9px] uppercase tracking-[0.4em] font-bold text-[#8A7A66]"
              >
                Atelier
              </motion.div>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
