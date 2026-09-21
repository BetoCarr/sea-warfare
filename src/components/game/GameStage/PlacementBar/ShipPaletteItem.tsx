import { SHIP_COLORS } from '@/application/board/presentation/ship-colors';
import type { ShipType } from '@/lib/domain/ships/models/ShipType';

interface ShipPaletteItemProps {
    type: ShipType;
    size: number;
    isSelected: boolean;
    onSelect: () => void;
}

const getShipVisualWidth = (size: number) =>
    `calc(${size} * clamp(0.75rem, 3.5vw, 1.25rem) + ${size - 1} * clamp(0.125rem, 0.7vw, 0.25rem))`;

export function ShipPaletteItem({
    type,
    size,
    isSelected,
    onSelect,
}: ShipPaletteItemProps) {
    return (
        
        <button
            onClick={onSelect}
            className={`
                h-[clamp(2.75rem,7dvh,3rem)] max-w-full min-w-0 w-auto
                flex flex-col items-start justify-center gap-1
                px-[clamp(0.375rem,1.5vw,0.5rem)] py-1
                rounded-md
                border
                transition-all duration-200
                ${
                    isSelected
                        ? 'border-blue-400 bg-blue-500/10 shadow-sm'
                        : 'border-slate-700/60 bg-slate-800/40 hover:border-slate-500 hover:bg-slate-800'
                }
            `}
        >
            <div
                className={`
                    h-[clamp(0.75rem,3.5vw,1.25rem)]
                    rounded-sm
                    ${SHIP_COLORS[type]}
                `}
                style={{ width: getShipVisualWidth(size) }}
            />

            <span className="text-[10px] uppercase text-slate-400 font-mono">
                {type}
            </span>
        </button>
    );
}