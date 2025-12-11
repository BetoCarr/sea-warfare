import React from 'react';
import { cn } from '@/lib/utils/utils';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, className = '' }) => {
  const baseClasses = 'inline-block px-2 py-1 rounded text-sm font-medium';
  return <span className={cn(baseClasses, className)}>{children}</span>;
};
