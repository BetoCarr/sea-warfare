import { cn } from "@/lib/utils/utils";

interface GameAreaProps {
    children: React.ReactNode;
    className?: string;
}

export default function GameArea({ children, className }: GameAreaProps) {
    return (
    <section
        className={cn(
            // Base — Mobile Portrait
            "flex-1 min-h-0 w-full max-w-full",
            "flex flex-col items-center justify-start",

            // Vertical spacing
            "gap-[clamp(1.5rem,5dvh,2.5rem)]",
            "pt-[clamp(2rem,6dvh,3.5rem)]",


            // Horizontal spacing
            "px-[clamp(0.5rem,3vw,1rem)]",

            // Tablet / Desktop
            // "md:flex-row md:justify-center",

            // Transitions
            "transition-transform duration-500",
            className,
        )}
    >
            {children}
        </section>
    );
}
