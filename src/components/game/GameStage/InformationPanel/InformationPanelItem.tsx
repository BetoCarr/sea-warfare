import { cn } from "@/lib/utils/utils";

type InformationPanelItemVariant = 'phase' | 'instruction' | 'stats';

interface InformationPanelItemProps {
    text: string;
    variant?: InformationPanelItemVariant;
}

const variantClasses: Record<InformationPanelItemVariant, string> = {
    phase: 'flex-[1.7_1_0%] border-amber-500/30',
    instruction: 'flex-[1_1_0%] border-sky-500/30',
    stats: 'flex-[1_1_0%] border-emerald-500/30',
};

const defaultVariantClass = 'border-slate-700/50';

export default function InformationPanelItem({
    text,
    variant,
}: InformationPanelItemProps) {
    return (
        <section
            className={cn(
                "w-full max-w-[260px] h-[93px]",
                "flex items-center justify-center",
                "border bg-[var(--color-bg-subpanel)]",
                "p-2 text-center font-mono whitespace-pre-line",
                variant ? variantClasses[variant] : defaultVariantClass,

                // Mobile Portrait
                "[@media_(max-width:767px)_and_(orientation:portrait)]:max-w-none",
                "[@media_(max-width:767px)_and_(orientation:portrait)]:min-h-0",
                "[@media_(max-width:767px)_and_(orientation:portrait)]:flex-1",
            )}
        >
            <div className="min-w-0 max-w-full whitespace-pre-line break-words">
                {text}
            </div>
        </section>
    );
}