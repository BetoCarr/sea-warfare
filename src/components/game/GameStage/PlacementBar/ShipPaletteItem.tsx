import { SHIP_COLORS } from '@/application/board/presentation/ship-colors';
import type { ShipType } from '@/lib/domain/ships/models/ShipType';

interface ShipPaletteItemProps {
    type: ShipType;
    size: number;
    isSelected: boolean;
    onSelect: () => void;
}

const getShipVisualWidth = (size: number) =>
    `calc(${size} * var(--segment) + ${(size - 1) * 3}px)`;

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
                h-12
                min-[400px]:min-w-24
                flex flex-col items-start justify-center gap-1
                px-2 py-1
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
                    h-3 min-[400px]:h-4
                    [--segment:12px] min-[400px]:[--segment:16px]
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
