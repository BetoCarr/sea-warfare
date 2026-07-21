import React from 'react';



import { cn } from '@/lib/utils/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  const baseClasses =
    'bg-[var(--color-bg-card)] rounded-lg p-4 shadow-md border border-slate-700';
  return <div className={cn(baseClasses, className)}>{children}</div>;
};
