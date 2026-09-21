import React from 'react';
import { cn } from '@/lib/utils/utils';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button: React.FC<ButtonProps> = ({
  className,
  children,
  ...rest
}) => {
  return (
    <button
      className={cn(
        "w-full h-full",
        "inline-flex items-center justify-center",
        "rounded-md",
        "font-semibold",
        "transition-all duration-200",
        "focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-offset-2",
        "focus-visible:ring-green-500",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "bg-green-600 text-white",
        "hover:bg-green-500",
        "shadow-sm",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
};
