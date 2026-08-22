'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import lottie from 'lottie-web';

/**
 * Clean Full-Duration Lottie Preloader
 * Renders ONLY the Lottie animation on a white background.
 * Plays /hupng-mp4-to-lottie-1787378261486.json for its full video duration
 * before smoothly transitioning to the next page.
 */
export default function Preloader({ onComplete }) {
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);
  const animRef = useRef(null);

  const handleFinish = () => {
    setLoading(false);
    if (onComplete) {
      onComplete();
    }
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    let anim = null;

    if (containerRef.current) {
      if (animRef.current) {
        animRef.current.destroy();
      }

      anim = lottie.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop: false,
        autoplay: true,
        path: '/hupng-mp4-to-lottie-1787378261486.json',
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid meet',
          progressiveLoad: true,
          hideOnTransparent: true,
        },
      });

      animRef.current = anim;

      // Play FULL video duration and after completion transition to next page
      anim.addEventListener('complete', () => {
        setTimeout(() => {
          handleFinish();
        }, 150);
      });
    }

    // Safety fallback timer in case file fails to load
    const safetyTimer = setTimeout(() => {
      handleFinish();
    }, 7500);

    return () => {
      document.body.style.overflow = '';
      clearTimeout(safetyTimer);
      if (animRef.current) {
        animRef.current.destroy();
      }
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
          key="letters-lottie-preloader"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.02,
            filter: 'blur(8px)',
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] }
          }}
          className="fixed inset-0 z-[999999] w-screen h-screen flex items-center justify-center bg-white select-none pointer-events-auto overflow-hidden will-change-transform p-4 md:p-8"
        >
          {/* ONLY the Lottie animation - Decreased size */}
          <div
            ref={containerRef}
            className="w-full max-w-md md:max-w-xl aspect-video max-h-[45vh] bg-transparent flex items-center justify-center transform-gpu"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}



