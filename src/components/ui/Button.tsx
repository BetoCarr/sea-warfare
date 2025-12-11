import React from 'react';
import { cn } from '@/lib/utils/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  className = '',
  children,
  ...rest
}) => {
  const baseClasses =
    'px-4 py-2 rounded font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

  const variantClasses = {
    primary: `bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed`,
    secondary: `bg-[var(--color-secondary)] text-white hover:bg-slate-600 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed`,
  }[variant];

  return (
    <button
      className={cn(baseClasses, variantClasses, className)}
      {...rest}
    >
      {children}
    </button>
  );
};
