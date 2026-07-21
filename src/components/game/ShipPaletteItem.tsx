import { ShipCells } from "./ShipCells";



import type { ShipType } from '@/lib/domain/ships/models/ShipType';

interface ShipPaletteItemProps {
    type: ShipType;
    size: number; // REVISAR si es necesario, o si se puede inferir del spec
    isSelected: boolean;
    selectShip: () => void;
}

export function ShipPaletteItem({
    type,
    size,
    isSelected,
    selectShip,
}: ShipPaletteItemProps) {
    return (
        <button
            onClick={selectShip}
            className={`
                flex flex-col items-start gap-1 p-2 rounded-lg border
                transition-all
                ${isSelected
                    ? 'border-blue-400 bg-blue-500/10'
                    : 'border-slate-700/40 hover:border-slate-500'}
            `}
        >
            {/* Visual del barco */}
            <ShipCells 
                size={size} 
                // cellSize="sm" 
            />

            {/* Label */}
            <span className="text-[10px] uppercase text-slate-400 font-mono">
                {type}
            </span>
        </button>
    );
}