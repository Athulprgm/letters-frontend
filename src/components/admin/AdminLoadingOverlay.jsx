'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faCircleExclamation, faRotate } from '@fortawesome/free-solid-svg-icons';
import { useAdminLoadingStore } from '@/src/store/adminLoadingStore';

export default function AdminLoadingOverlay() {
  const { isLoading, message, subMessage, status } = useAdminLoadingStore();

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="admin-loading-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md select-none"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="w-full max-w-sm bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 sm:p-7 shadow-2xl text-center space-y-4 relative overflow-hidden"
          >
            {/* Ambient Background Glow */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-36 h-36 bg-[var(--olive)]/15 rounded-full blur-2xl pointer-events-none" />

            {/* Visual Icon / Animated Spinner */}
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              {status === 'loading' && (
                <>
                  {/* Outer Pulsing Aura */}
                  <span className="absolute inset-0 rounded-full bg-[var(--olive)]/20 animate-ping opacity-75" />
                  
                  {/* Rotating Conic Ring */}
                  <div className="w-16 h-16 rounded-full border-3 border-[var(--border)] border-t-[var(--olive)] animate-spin" />
                  
                  {/* Brand Monogram in Center */}
                  <span
                    className="absolute inset-0 flex items-center justify-center text-[var(--olive)] font-bold text-xs"
                    style={{ fontFamily: "'Great Vibes', cursive", fontSize: '20px' }}
                  >
                    L
                  </span>
                </>
              )}

              {status === 'success' && (
                <motion.div
                  initial={{ scale: 0.5, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-3xl border border-emerald-500/30"
                >
                  <FontAwesomeIcon icon={faCircleCheck} />
                </motion.div>
              )}

              {status === 'error' && (
                <motion.div
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center text-3xl border border-rose-500/30"
                >
                  <FontAwesomeIcon icon={faCircleExclamation} />
                </motion.div>
              )}
            </div>

            {/* Text Information */}
            <div className="space-y-1.5 pt-1">
              <h3 className="font-bold text-sm sm:text-base text-[var(--text)] tracking-tight">
                {message || 'Processing Request...'}
              </h3>
              {subMessage && (
                <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-xs mx-auto">
                  {subMessage}
                </p>
              )}
            </div>

            {/* Subtle Progress Track Indicator */}
            {status === 'loading' && (
              <div className="w-full bg-[var(--bg)] h-1.5 rounded-full overflow-hidden border border-[var(--border)] mt-2">
                <motion.div
                  className="h-full bg-gradient-to-r from-[var(--chandanam)] to-[var(--olive)] rounded-full"
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                />
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
