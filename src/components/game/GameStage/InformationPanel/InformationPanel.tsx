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
        <section className=" w-full max-w-[1400px] min-h-[160px] mx-auto flex flex-row items-center justify-center-safe gap-40 mb-12 bg-slate-800 border border-slate-700/50 p-2" >            
            <PhaseContext phaseLabel={phaseLabel} description={description} />
            <Instruction instruction={instruction} />
            {stats && <Stats stats={stats} />}
        </section>
    );
}
