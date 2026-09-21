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
                // Layout
                "absolute left-1/2 top-[clamp(3rem,5dvh,4rem)] z-70",
                "flex items-center justify-center",
                "w-[clamp(13rem,60vw,22rem)]",

                "-translate-x-1/2",

                // Spacing
                "gap-[clamp(0.375rem,1vw,0.625rem)]",
                "px-[clamp(0.5rem,1.5vw,0.75rem)]",
                "py-[clamp(0.5rem,1.5dvh,0.75rem)]",

                // Typography
                "text-center text-xs leading-tight",
                "sm:text-sm",
                "md:text-base md:max-w-lg",

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
