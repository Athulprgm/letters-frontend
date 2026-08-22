import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTriangleExclamation,
  faTrashCan,
  faCircleQuestion,
  faCircleCheck,
  faCircleInfo,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { useConfirmStore } from '@/src/store/confirmStore';

export default function ConfirmModal() {
  const { isOpen, title, message, confirmText, cancelText, type, handleConfirm, handleCancel } =
    useConfirmStore();

  // Keyboard shortcut support (Escape to cancel, Enter to confirm)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleCancel, handleConfirm]);

  const config = {
    danger: {
      icon: faTrashCan,
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
      glow: 'shadow-[0_0_30px_rgba(225,29,72,0.15)]',
      confirmBtn: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20 hover:shadow-rose-600/30',
      badgeText: 'text-rose-600 dark:text-rose-400',
    },
    warning: {
      icon: faTriangleExclamation,
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
      glow: 'shadow-[0_0_30px_rgba(245,158,11,0.15)]',
      confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20 hover:shadow-amber-600/30',
      badgeText: 'text-amber-600 dark:text-amber-400',
    },
    info: {
      icon: faCircleQuestion,
      iconBg: 'bg-[var(--olive)]/10 text-[var(--olive)] border border-[var(--olive)]/20',
      glow: 'shadow-[0_0_30px_rgba(58,79,52,0.15)]',
      confirmBtn: 'bg-[var(--olive)] hover:bg-[var(--olive-hover)] text-white shadow-olive-600/20',
      badgeText: 'text-[var(--olive)]',
    },
    success: {
      icon: faCircleCheck,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
      glow: 'shadow-[0_0_30px_rgba(16,185,129,0.15)]',
      confirmBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20',
      badgeText: 'text-emerald-600 dark:text-emerald-400',
    },
  }[type || 'danger'];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleCancel}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            aria-describedby="confirm-modal-desc"
            className={`relative w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl p-6 sm:p-7 overflow-hidden z-10 ${config.glow}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Subtle top ambient gradient */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--border)] to-transparent opacity-50" />

            {/* Close Button */}
            <button
              type="button"
              onClick={handleCancel}
              className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text)] w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--bg)] transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <FontAwesomeIcon icon={faXmark} className="text-sm" />
            </button>

            <div className="flex flex-col items-center text-center">
              {/* Icon Badge */}
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform ${config.iconBg}`}
              >
                <FontAwesomeIcon icon={config.icon} className="text-2xl" />
              </div>

              {/* Title */}
              <h3
                id="confirm-modal-title"
                className="text-lg sm:text-xl font-bold tracking-tight text-[var(--text)] font-heading"
              >
                {title}
              </h3>

              {/* Message */}
              <p
                id="confirm-modal-desc"
                className="mt-2.5 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed max-w-sm"
              >
                {message}
              </p>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5 w-full">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full sm:w-1/2 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--bg)] text-xs sm:text-sm font-semibold text-[var(--text)] shadow-xs hover:border-[var(--text-muted)] transition-all cursor-pointer"
                >
                  {cancelText}
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className={`w-full sm:w-1/2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer ${config.confirmBtn}`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
