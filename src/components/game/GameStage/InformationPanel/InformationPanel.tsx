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
                "tablet-portrait:h-[clamp(430px,calc(19.89dvh_+_226px),500px)]",
                "tablet-portrait:w-[clamp(200px,calc(19.89dvh_-_3.71px),270px)]",
                "tablet-portrait:mt-9",
                "tablet-portrait:mr-4",

                // Desktop
                "desktop:w-[clamp(800px,80vw,1200px)]",
                // "desktop:h-[140px]",
                "desktop:h-[clamp(100px,14dvh,140px)]",
                "desktop:flex-row",
                "desktop:items-center",
                "desktop:justify-center",
                "desktop:gap-8",
                "desktop:mx-auto",
                "desktop:mb-6",

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
