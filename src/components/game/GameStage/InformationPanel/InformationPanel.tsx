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
                "w-full max-w-[1400px] min-h-[160px]",
                "mx-auto flex flex-row items-center justify-center",
                "gap-40 mb-12",
                "bg-slate-800 border border-slate-700/50 p-2",

                // Mobile Portrait
                "max-md:flex-col",
                "max-md:h-[155px]",
                "max-md:min-h-0",
                "max-md:gap-0",
                "max-md:mb-0",

                // Mobile Landscape
                "[@media_(max-width:1023px)_and_(orientation:landscape)]:w-[165px]",
                "[@media_(max-width:1023px)_and_(orientation:landscape)]:h-[376px]",
                "[@media_(max-width:1023px)_and_(orientation:landscape)]:min-h-0",
                "[@media_(max-width:1023px)_and_(orientation:landscape)]:flex-col",
                "[@media_(max-width:1023px)_and_(orientation:landscape)]:gap-0",
                "[@media_(max-width:1023px)_and_(orientation:landscape)]:mb-0",
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
