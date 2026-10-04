import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'accent' | 'earth' | 'danger' | 'ghost' | 'white';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-2.5 gap-2.5',
  }[size];

  const variantClasses = {
    primary: 'bg-krishi-green hover:bg-krishi-green-light text-white shadow-sm focus:ring-krishi-green',
    secondary: 'bg-surface-secondary text-krishi-text hover:bg-krishi-border border border-krishi-border focus:ring-krishi-border',
    outline: 'border border-krishi-green text-krishi-green hover:bg-krishi-green hover:text-white focus:ring-krishi-green',
    accent: 'bg-krishi-accent hover:opacity-90 text-white shadow-sm focus:ring-krishi-accent',
    earth: 'bg-krishi-earth hover:bg-krishi-earth-light text-white shadow-sm focus:ring-krishi-earth',
    danger: 'bg-krishi-danger hover:opacity-90 text-white shadow-sm focus:ring-krishi-danger',
    ghost: 'text-krishi-text-secondary hover:text-krishi-green hover:bg-surface-secondary focus:ring-krishi-green',
    white: 'bg-white text-emerald-950 font-bold hover:bg-emerald-50 shadow-md border border-transparent focus:ring-white',
  }[variant];

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
};
