interface PhaseContextProps {
    phaseLabel: string;
    description: string | null;
}

export default function PhaseContext({
    phaseLabel,
    description,
}: PhaseContextProps) {
    return (
        <section className="w-full max-w-[260px] min-h-[93px] md:h-[93px] flex flex-col items-center justify-center border border-slate-700/50 bg-[var(--color-bg-subpanel)] p-2 text-center font-mono">
            <h2>{phaseLabel}</h2>
            {description && <p>{description}</p>}
        </section>
    );
}
