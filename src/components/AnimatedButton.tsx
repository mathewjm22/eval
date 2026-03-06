import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../theme';

interface AnimatedButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
}

export function AnimatedButton({
  variant = 'primary',
  size = 'md',
  children,
  loading = false,
  className = '',
  style,
  disabled,
  onClick,
  type = 'button',
  'aria-label': ariaLabel,
}: AnimatedButtonProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const sizeClasses: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return isDark
          ? { background: 'linear-gradient(135deg, #7c3aed, #00d4ff)', color: '#fff', border: 'none' }
          : { background: 'linear-gradient(135deg, #4f46e5, #0ea5e9)', color: '#fff', border: 'none' };
      case 'secondary':
        return isDark
          ? { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.12)' }
          : { background: 'var(--panel)', color: 'var(--text)', border: '1px solid var(--border)' };
      case 'danger':
        return isDark
          ? { background: 'linear-gradient(135deg, #dc2626, #ff2d78)', color: '#fff', border: 'none' }
          : { background: '#dc2626', color: '#fff', border: 'none' };
      case 'ghost':
        return { background: 'transparent', color: isDark ? 'rgba(255,255,255,0.7)' : 'var(--muted)', border: 'none' };
      default:
        return {};
    }
  };

  const isDisabled = disabled || loading;

  return (
    <motion.button
      whileHover={isDisabled ? {} : { scale: 1.03, y: -1 }}
      whileTap={isDisabled ? {} : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={ariaLabel}
      className={`rounded-xl font-semibold inline-flex items-center gap-2 ${sizeClasses[size]} ${className}`}
      style={{
        ...variantStyles(),
        opacity: isDisabled ? 0.55 : 1,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
    >
      {loading && (
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full"
        />
      )}
      {children}
    </motion.button>
  );
}
