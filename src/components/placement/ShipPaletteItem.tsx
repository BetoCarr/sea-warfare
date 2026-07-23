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
                flex flex-col items-start gap-2 p-2 rounded-lg border
                transition-all
                ${
                    isSelected
                        ? 'border-blue-400 bg-blue-500/10'
                        : 'border-slate-700/40 hover:border-slate-500'
                }
            `}
        >
            <div className="flex flex-row gap-[2px]">
                {Array.from({ length: size }).map((_, index) => (
                    <div
                        key={index}
                        className="w-4 h-4 rounded-sm bg-slate-400"
                    />
                ))}
            </div>

            <span className="text-[10px] uppercase text-slate-400 font-mono">
                {type}
            </span>
        </button>
    );
}
























// import { ShipCells } from "./ShipCells";



// import type { ShipType } from '@/lib/domain/ships/models/ShipType';

// interface ShipPaletteItemProps {
//     type: ShipType;
//     size: number; // REVISAR si es necesario, o si se puede inferir del spec
//     isSelected: boolean;
//     selectShip: () => void;
// }

// export function ShipPaletteItem({
//     type,
//     size,
//     isSelected,
//     selectShip,
// }: ShipPaletteItemProps) {
//     return (
//         <button
//             onClick={selectShip}
//             className={`
//                 flex flex-col items-start gap-1 p-2 rounded-lg border
//                 transition-all
//                 ${isSelected
//                     ? 'border-blue-400 bg-blue-500/10'
//                     : 'border-slate-700/40 hover:border-slate-500'}
//             `}
//         >
//             {/* Visual del barco */}
//             <ShipCells 
//                 size={size} 
//                 // cellSize="sm" 
//             />

//             {/* Label */}
//             <span className="text-[10px] uppercase text-slate-400 font-mono">
//                 {type}
//             </span>
//         </button>
//     );
// }