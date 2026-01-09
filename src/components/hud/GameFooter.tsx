"use client";

import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '@/lib/store/game-store';
import { GamePhase } from '@/lib/store/game-types';
import { cn } from '@/lib/utils/utils';

interface GameFooterProps {
    children?: React.ReactNode;
    className?: string;
}

/**
 * GameFooter
 * ------------------------------------------------------------
 * A persistent responsive footer component for the game screen.
 * Reserves vertical space at the bottom of the screen across all phases.
 */
export const GameFooter = ({ children, className }: GameFooterProps) => {
    return (
        <footer className={cn(
            "flex-none relative z-30 w-full transition-all duration-500 ease-in-out",
            "bg-slate-900/60 backdrop-blur-lg border-t border-white/5",
            "pb-[max(0.5rem,env(safe-area-inset-bottom))] min-h-[4rem] sm:min-h-[5rem]",
            "flex items-center",
            className
        )}>
            {children}
        </footer>
    );
};

