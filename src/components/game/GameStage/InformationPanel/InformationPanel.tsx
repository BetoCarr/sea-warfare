import { cn } from '@/lib/utils/utils';
import InformationPanelItem from './InformationPanelItem';

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
        <section
            className={cn(
                // Base — Mobile Portrait
                "w-full h-[clamp(100px,12.5dvh,120px)]",
                "flex flex-col items-center justify-center",
                "gap-0 mb-0",
                "min-h-0",

                // Mobile Landscape
                "mobile-landscape:w-[145px]",
                "mobile-landscape:h-[clamp(210px,calc(138.46dvh_-_309px),300px)]",
                "mobile-landscape:shrink-0",
                "mobile-landscape:mr-3",

                // Tablet Portrait
                "tablet-portrait:h-[430px]",
                "tablet-portrait:w-[200px]",
                "tablet-portrait:mt-9",
                "tablet-portrait:mr-4",

                // Visual
                "bg-slate-800 border border-slate-700/50",
            )}
        >
            <InformationPanelItem
                text={description ? `${phaseLabel}\n${description}` : phaseLabel}
                variant="phase"
            />
            <InformationPanelItem text={instruction} variant="instruction" />
            {stats && <InformationPanelItem text={stats} variant="stats" />}
        </section>
    );
}
