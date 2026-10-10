import { cn } from '@/lib/utils/utils';

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
            className={cn(
                // Layout
                "absolute left-1/2 top-12 z-70",
                "flex items-center justify-center",
                "max-w-[22rem] w-max",
                "-translate-x-1/2",

                // Spacing,
                "gap-2 px-3 py-2",
                
                // Typography
                "text-center text-xs leading-tight",
                "tablet-portrait:text-sm",
                "tablet-portrait:px-4 tablet-portrait:py-3",

                // Visual
                "rounded-md border shadow-md",
                "bg-slate-800 border-slate-600 text-slate-200",

                className
            )}
            role="alert"
        >
            <span className="font-medium">{message}</span>
        </div>
    );
};
