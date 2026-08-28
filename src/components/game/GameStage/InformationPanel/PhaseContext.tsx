interface PhaseContextProps {
    phaseLabel: string;
    description: string | null;
}

export default function PhaseContext({
    phaseLabel,
    description,
}: PhaseContextProps) {
    return (
        <section className="w-full max-w-[260px] min-h-[93px] md:h-[93px] border border-slate-700/50 p-2">
            <h2>{phaseLabel}</h2>
            {description && <p>{description}</p>}
        </section>
    );
}
