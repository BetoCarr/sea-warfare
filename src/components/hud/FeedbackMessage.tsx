import { clsx } from 'clsx';
import { useEffect, useState } from 'react';

export type FeedbackType = 'info' | 'success' | 'error' | 'warning';

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
        success: "bg-emerald-900/80 border-emerald-600 text-emerald-100",
        error: "bg-red-900/80 border-red-600 text-red-100",
        warning: "bg-amber-900/80 border-amber-600 text-amber-100"
    };

    const icons = {
        info: "ℹ️",
        success: "✅",
        error: "⚠️",
        warning: "✋"
    };

    return (
        <div
            className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-md border text-sm shadow-md transition-all duration-300",
                styles[type],
                isVisible ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-2 pointer-events-none",
                className
            )}
            role="alert"
        >
            <span className="text-base select-none">{icons[type]}</span>
            <span className="font-medium">{message}</span>
        </div>
    );
};
