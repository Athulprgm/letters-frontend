'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

export default function FestiveBottomCutout() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);

  // Do not render on admin pages
  const isAdminRoute = pathname?.startsWith('/admin');
  if (isAdminRoute || !visible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        animate={{
          x: [-140, 0, 0, 0, -140],
          opacity: [0, 1, 1, 1, 0],
        }}
        transition={{
          duration: 7, // 7 seconds active cycle (visible ~5s, transit ~2s)
          times: [0, 0.14, 0.78, 0.9, 1],
          repeat: Infinity,
          repeatDelay: 5, // 5 seconds gap between appearances
          ease: 'easeInOut',
        }}
        className="fixed bottom-3 left-3 sm:bottom-5 sm:left-5 z-40 pointer-events-auto select-none group"
      >
        {/* Cutout Container */}
        <div className="relative flex items-center justify-center">
          
          {/* Close / Dismiss Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setVisible(false);
            }}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[var(--card)]/90 backdrop-blur-sm border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] flex items-center justify-center text-[9px] shadow-sm z-50 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
            aria-label="Dismiss character badge"
            title="Dismiss"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>

          {/* Clickable Character Link */}
          <Link
            href="/shop"
            className="block relative cursor-pointer"
            title="Explore Festive Hampers"
          >
            {/* Cutout Image with natural shadow and gentle floating motion */}
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative w-28 sm:w-36 md:w-44 filter drop-shadow-[0_12px_22px_rgba(0,0,0,0.18)]"
            >
              <img
                src="/hamper-bottom-art.png"
                alt="Festive Character Cutout"
                className="w-full h-auto object-contain pointer-events-none"
              />
            </motion.div>
          </Link>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
