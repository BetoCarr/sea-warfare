import PhaseContext from './PhaseContext';
import Instruction from './Instruction';
import Stats from './Stats';

interface InformationPanelProps {
    phaseLabel: string;
    description: string | null;
    instruction: string;
    stats?: string;
}

export default function InformationPanel({
    phaseLabel,
    description,
    instruction,
    stats,
}: InformationPanelProps) {
    return (
        <section className="w-full flex flex-col gap-2 border border-slate-700/50 p-2">
            <PhaseContext phaseLabel={phaseLabel} description={description} />
            <Instruction instruction={instruction} />
            {stats && <Stats stats={stats} />}
        </section>
    );
}
