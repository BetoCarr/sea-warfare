import { cn } from "@/lib/utils/utils";

interface GameAreaProps {
    children: React.ReactNode;
}

export default function GameArea({ children }: GameAreaProps) {
    return (
    <section
        className={cn(
            // Base — Mobile Portrait
            "flex-1 min-h-0 w-full max-w-full",
            "flex flex-col items-center justify-between gap-30",

            // Tablet / Desktop
            "md:flex-row md:justify-center",

            // Transitions
            "transition-transform duration-500",
        )}
    >
            {children}
        </section>
    );
}
