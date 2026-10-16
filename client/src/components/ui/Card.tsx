import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'raised' | 'bordered' | 'subtle';
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'default',
      interactive = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles = 'rounded-surface transition-colors duration-150';

    const variantStyles = {
      default: 'bg-surface border border-line-subtle shadow-card',
      raised: 'bg-surface-raised border border-line-base shadow-subtle',
      bordered: 'bg-transparent border border-line-base',
      subtle: 'bg-canvas border border-line-subtle',
    };

    // Prohibit card lift on hover per Campus Atlas anti-slop guidelines
    const interactiveStyles = interactive
      ? 'hover:border-line-strong active:bg-canvas/80 cursor-pointer'
      : '';

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${interactiveStyles} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
export default Card;
