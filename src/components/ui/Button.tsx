import React from 'react';
import { cn } from '@/lib/utils/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'icon';
  fullWidth?: boolean;
  pulse?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'default',
  fullWidth = false,
  pulse = false,
  className = '',
  children,
  ...rest
}) => {
  const baseClasses =
    'inline-flex items-center justify-center rounded-md font-semibold ' +
    'transition-all duration-200 ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
    'disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary:
      'bg-blue-600 text-white hover:bg-blue-500 focus-visible:ring-blue-500 shadow-sm',
    success:
      'bg-green-600 text-white hover:bg-green-500 focus-visible:ring-green-500 shadow-sm',
    secondary:
      'bg-slate-700 text-slate-100 hover:bg-slate-600 focus-visible:ring-slate-500',
    ghost:
      'bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white',
    outline:
      'bg-transparent border border-slate-600 text-slate-300 hover:border-slate-500 hover:text-white',
  }[variant];

  const sizeClasses = {
    default: 'py-2.5 px-5 text-sm',
    sm: 'py-1.5 px-3 text-xs',
    icon: 'p-2 aspect-square',
  }[size];

  const widthClass = fullWidth ? 'w-full' : 'w-auto';
  const pulseClass = pulse ? 'animate-pulse ring-2 ring-offset-2 ring-offset-slate-900 ring-current' : '';

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses,
        sizeClasses,
        widthClass,
        pulseClass,
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
};
