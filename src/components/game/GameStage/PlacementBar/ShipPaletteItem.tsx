import { cn } from '@/lib/utils/utils';

import { SHIP_COLORS } from '@/application/board/presentation/ship-colors';
import type { ShipType } from '@/lib/domain/ships/models/ShipType';

interface ShipPaletteItemProps {
    type: ShipType;
    size: number;
    isSelected: boolean;
    onSelect: () => void;
}

export function ShipPaletteItem({
    type,
    size,
    isSelected,
    onSelect,
}: ShipPaletteItemProps) {
    return (
        <button
            onClick={onSelect}
            className={cn(
                "@container",
                "w-full h-full min-w-0 min-h-0",
                "flex flex-col items-start justify-center gap-1",
                "px-2 py-1",
                "rounded-md border transition-all duration-200",
                isSelected
                    ? "border-blue-400 bg-blue-500/10 shadow-sm"
                    : "border-slate-700/60 bg-slate-800/40 hover:border-slate-500 hover:bg-slate-800",
            )}
        >
            <div
                className={cn(
                    "flex w-full min-w-0 items-center gap-[3px]",
                    "[--segment:clamp(12px,calc((100cqw_-_16px)/5),25px)]"

                )}
            >
                {Array.from({ length: size }, (_, index) => (
                    <div
                        key={index}
                        className={cn(
                            "size-[var(--segment)] shrink-0",
                            "rounded-sm",
                            SHIP_COLORS[type],
                        )}
                    />
                ))}
            </div>

            <span className="text-[10px] uppercase text-slate-400 font-mono">
                {type}
            </span>
        </button>
    );
}
