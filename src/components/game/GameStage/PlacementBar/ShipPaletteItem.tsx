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
            className={`
                w-full
                flex flex-col items-start gap-3
                p-3
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
            <div className="flex flex-row gap-1">
                {Array.from({ length: size }).map((_, index) => (
                    <div
                        key={index}
                        className="w-5 h-5 rounded-sm bg-slate-400"
                    />
                ))}
            </div>

            <span className="text-[10px] uppercase text-slate-400 font-mono">
                {type}
            </span>
        </button>
    );
}