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

                // // Tablet Portrait
                // "[@media_(min-width:768px)_and_(max-width:1023px)_and_(orientation:portrait)]:w-full",
                // "[@media_(min-width:768px)_and_(max-width:1023px)_and_(orientation:portrait)]:h-auto",
                // "[@media_(min-width:768px)_and_(max-width:1023px)_and_(orientation:portrait)]:min-h-[160px]",
                // "[@media_(min-width:768px)_and_(max-width:1023px)_and_(orientation:portrait)]:flex-row",
                // "[@media_(min-width:768px)_and_(max-width:1023px)_and_(orientation:portrait)]:gap-40",
                // "[@media_(min-width:768px)_and_(max-width:1023px)_and_(orientation:portrait)]:mb-12",

                // Mobile Landscape
                // "[@media_(min-width:768px)_and_(max-width:1023px)_and_(orientation:landscape)]:w-[165px]",
                // "[@media_(min-width:768px)_and_(max-width:1023px)_and_(orientation:landscape)]:h-[376px]",
                // "[@media_(min-width:768px)_and_(max-width:1023px)_and_(orientation:landscape)]:min-h-0",
                // "[@media_(min-width:768px)_and_(max-width:1023px)_and_(orientation:landscape)]:flex-col",

                // Tablet Landscape / Desktop
                // "lg:w-full",
                // "lg:max-w-[1400px]",
                // // "lg:align-self-center",
                // "lg:h-auto",
                // "lg:min-h-[160px]",
                // "lg:flex-row",
                // "lg:gap-40",
                // "lg:mb-12",

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
