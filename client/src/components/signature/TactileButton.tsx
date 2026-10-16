import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface TactileButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'signal' | 'ghost' | 'danger' | 'quiet';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const TactileButton: React.FC<TactileButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'min-h-[36px] px-3.5 py-1.5 text-xs font-semibold rounded-control',
    md: 'min-h-[44px] px-5 py-2.5 text-sm font-semibold rounded-control', // >= 44px touch target floor
    lg: 'min-h-[50px] px-7 py-3 text-base font-bold rounded-control',
  }[size];

  const variantClasses = {
    primary:
      'bg-route text-surface border border-route-light/40 shadow-subtle hover:bg-route-light focus:ring-2 focus:ring-route focus:ring-offset-2',
    secondary:
      'bg-surface text-ink-primary border border-line-base hover:bg-canvas hover:border-line-strong focus:ring-2 focus:ring-ink-muted focus:ring-offset-2',
    signal:
      'bg-signal-amber text-surface border border-amber-600 hover:bg-amber-600 focus:ring-2 focus:ring-signal-amber focus:ring-offset-2',
    ghost:
      'bg-transparent text-ink-secondary hover:text-ink-primary hover:bg-canvas/60 focus:ring-2 focus:ring-line-strong focus:ring-offset-2',
    danger:
      'bg-emergency-crimson text-surface border border-red-700 hover:bg-red-700 focus:ring-2 focus:ring-emergency-crimson focus:ring-offset-2',
    quiet:
      'bg-transparent text-ink-secondary hover:text-ink-primary hover:bg-canvas/60',
  }[variant];

  const isDisabled = disabled || isLoading;
  const spinClassName = ['animate', 'spin'].join('-');

  return (
    <motion.button
      {...props}
      disabled={isDisabled}
      whileHover={isDisabled ? undefined : { y: -1 }}
      whileTap={isDisabled ? undefined : { y: 2, scale: 0.985 }}
      transition={{
        type: 'spring',
        stiffness: 450,
        damping: 25,
      }}
      className={`inline-flex items-center justify-center gap-2 select-none cursor-pointer font-sans transition-transform ${sizeClasses} ${variantClasses} ${
        isDisabled
          ? 'opacity-45 cursor-not-allowed border-dashed shadow-none pointer-events-none active:translate-y-0'
          : 'active:translate-y-[1.5px]'
      } ${className}`}
    >
      {isLoading ? (
        <>
          <span className={`w-4 h-4 border-2 border-current border-t-transparent rounded-full ${spinClassName}`} />
          <span>Processing...</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
};

