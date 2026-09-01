interface GameAreaProps {
    children: React.ReactNode;
}
export default function GameArea({ children }: GameAreaProps) {
    return (
        <section className="flex-1 min-h-0 w-full max-w-full flex items-center justify-center gap-30 transition-transform duration-500">
            {children}
        </section>
    );
}
