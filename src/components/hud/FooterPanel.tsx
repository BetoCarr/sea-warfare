"use client";

import React from 'react';
import { cn } from '@/lib/utils/utils';

interface FooterPanelProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
}

/**
 * FooterPanel
 * ------------------------------------------------------------
 * A reusable container for footer modules.
 * Handles background blur, border, padding, and subtle animations.
 */
export const FooterPanel = ({ children, className, title }: FooterPanelProps) => {
    return (
        <div className={cn(
            "relative flex flex-col gap-2 p-3 sm:p-4 rounded-2xl",
            "bg-slate-900/40 backdrop-blur-xl border border-slate-700/40",
            "shadow-2xl transition-all duration-300 hover:border-slate-600/60",
            className
        )}>
            {title && (
                <h3 className="text-[9px] font-black text-slate-500/80 uppercase tracking-[0.3em] px-0.5">
                    {title}
                </h3>
            )}

            <div className="flex-1 min-h-0">
                {children}
            </div>
        </div>
    );
};
