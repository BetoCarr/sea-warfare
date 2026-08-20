interface PhaseContextProps {
    phaseLabel: string;
    description: string | null;
}

export default function PhaseContext({
    phaseLabel,
    description,
}: PhaseContextProps) {
    return (
        <section className="border border-slate-700/50 p-2">
            <h2>{phaseLabel}</h2>
            {description && <p>{description}</p>}
        </section>
    );
}
