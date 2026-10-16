import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'brand';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full select-none whitespace-nowrap shrink-0';

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  const variantStyles = {
    default: 'bg-[#F0F2ED] text-[#5B5F58] border border-[#E4E5E1]',
    brand: 'bg-[#E8F4F0] text-[#143D32] border border-[#20594B]/20',
    success: 'bg-[#E7F6EE] text-[#1E8E5A] border border-[#1E8E5A]/20',
    warning: 'bg-[#FEF3C7] text-[#B45309] border border-[#B45309]/20',
    danger: 'bg-[#FDE8E7] text-[#C0392B] border border-[#C0392B]/20',
    info: 'bg-[#E0F2FE] text-[#0284C7] border border-[#0284C7]/20',
  };

  return (
    <span
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
