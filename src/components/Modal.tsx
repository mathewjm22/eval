import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../theme';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ open, onClose, title, children, maxWidth = '32rem' }: ModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              background: isDark ? 'rgba(0,0,0,0.65)' : 'rgba(15,23,42,0.4)',
              backdropFilter: 'blur(4px)',
            }}
          />
          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.93, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 24 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 51,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              padding: '1rem',
            }}
          >
            <div
              style={{
                pointerEvents: 'auto',
                width: '100%',
                maxWidth,
                borderRadius: '1.25rem',
                background: isDark ? 'rgba(18,18,31,0.97)' : '#fff',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                boxShadow: isDark
                  ? '0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)'
                  : '0 24px 60px rgba(15,23,42,0.14)',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              {title && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem 1.25rem 0.75rem',
                    borderBottom: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid #f1f5f9',
                  }}
                >
                  <h2
                    style={{
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      color: isDark ? 'rgba(255,255,255,0.92)' : '#0f172a',
                    }}
                  >
                    {title}
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: isDark ? 'rgba(255,255,255,0.45)' : '#94a3b8',
                      fontSize: '1.25rem',
                      lineHeight: 1,
                      padding: '0.25rem',
                    }}
                    aria-label="Close modal"
                  >
                    ✕
                  </motion.button>
                </div>
              )}
              {/* Body */}
              <div style={{ padding: '1.25rem' }}>{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
