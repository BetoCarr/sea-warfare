import { clsx } from 'clsx';

export type FeedbackType = string;

interface FeedbackMessageProps {
    message: string;
    className?: string;
}

export const FeedbackMessage = ({
    message,
    className
}: FeedbackMessageProps) => {
    return (
        <div
            className={clsx(
                "flex items-center gap-2 px-2 py-2 rounded-md border shadow-md",
                "absolute top-4 left-1/2 -translate-x-1/2 z-50",
                "text-xs leading-snug max-w-[90vw]",
                "sm:gap-3 sm:px-4 sm:py-3 sm:text-sm sm:max-w-md",
                "md:text-base md:max-w-lg",
                "bg-slate-800 border-slate-600 text-slate-200",
                className
            )}
            role="alert"
        >
            <span className="font-medium">{message}</span>
        </div>
    );
};
