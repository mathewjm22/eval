import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../theme';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function LoadingSpinner({ size = 'md', label }: LoadingSpinnerProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const sizeMap = { sm: 24, md: 40, lg: 60 };
  const strokeWidth = { sm: 3, md: 3.5, lg: 4 };
  const px = sizeMap[size];
  const sw = strokeWidth[size];
  const r = (px - sw * 2) / 2;
  const circumference = 2 * Math.PI * r;

  const trackColor = isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0';
  const spinnerColor = isDark ? '#00d4ff' : '#4f46e5';

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <motion.svg
        width={px}
        height={px}
        viewBox={`0 0 ${px} ${px}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        {/* Track */}
        <circle
          cx={px / 2}
          cy={px / 2}
          r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth={sw}
        />
        {/* Spinner arc */}
        <circle
          cx={px / 2}
          cy={px / 2}
          r={r}
          fill="none"
          stroke={spinnerColor}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * 0.75}
          style={{ transformOrigin: 'center' }}
        />
      </motion.svg>
      {label && (
        <p className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.55)' : 'var(--muted)' }}>
          {label}
        </p>
      )}
    </div>
  );
}
