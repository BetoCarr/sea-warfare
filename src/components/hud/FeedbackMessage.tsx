import { clsx } from 'clsx';

import { useEffect, useState } from 'react';

export type FeedbackType = 'info' | 'success' | 'error' | 'warning' | 'instruction';

interface FeedbackMessageProps {
    message: string | null;
    type?: FeedbackType;
    duration?: number; // Duration in ms to auto-dismiss (optional)
    onDismiss?: () => void;
    className?: string;
}

/**
 * FeedbackMessage
 * ----------------------------------------------------------------------
 * A reusable component to display status updates, errors, or game info.
 * Supports different visual variants based on message type.
 */
export const FeedbackMessage = ({
    message,
    type = 'info',
    duration,
    onDismiss,
    className
}: FeedbackMessageProps) => {
    const [isVisible, setIsVisible] = useState(false);

    // Effect for handling visibility and auto-dismiss
    useEffect(() => {
        if (message) {
            setIsVisible(true);
            
            if (duration && duration > 0) {
                const timer = setTimeout(() => {
                    setIsVisible(false);
                    onDismiss?.();
                }, duration);
                return () => clearTimeout(timer);
            }
        } else {
            setIsVisible(false);
        }
    }, [message, duration, onDismiss]);

    if (!message && !isVisible) return null;

    const styles = {
        info: "bg-slate-800 border-slate-600 text-slate-200",
        success: "bg-emerald-900/90 border-emerald-600 text-emerald-100",
        error: "bg-red-900/90 border-red-600 text-red-100",
        warning: "bg-amber-900/90 border-amber-600 text-amber-100",
        instruction: "bg-slate-800/80 border-slate-600/50 text-sky-200 backdrop-blur-sm"
    };

    const icons = {
        info: "ℹ️",
        success: "✅",
        error: "⚠️",
        warning: "✋",
        instruction: "💡"
    };

    return (
        <div
            className={clsx(
                // Base (mobile portrait)
                "flex items-center gap-2 px-2 py-2 rounded-md border shadow-md",
                "text-xs leading-snug max-w-[90vw]",
                "transition-all duration-300 ease-out",

                // Visibility animation
                isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-2 pointer-events-none",

                // Responsive scaling
                "sm:gap-3 sm:px-4 sm:py-3 sm:text-sm sm:max-w-md",
                "md:text-base md:max-w-lg",

                styles[type],
                className
            )}
            role="alert"
        >
            <span className="text-sm sm:text-base md:text-xl select-none">{icons[type]}</span>
            <span className="font-medium">{message}</span>
        </div>
    );
};
