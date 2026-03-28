import { Orientation } from "@/lib/utils/types";


interface ShipCellsProps {
    size: number;
    orientation?: Orientation;
    cellSize?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'hit' | 'sunk' | 'preview';
}

export function ShipCells({
    size,
    orientation = 'horizontal',
    cellSize = 'md',
    variant = 'default',
}: ShipCellsProps) {
    return (
        <div className={`flex ${orientation === 'horizontal' ? 'flex-row' : 'flex-col'} gap-[2px]`}>
            {Array.from({ length: size }).map((_, i) => (
                <div
                    key={i}
                    className={`
                        ${cellSize === 'sm' ? 'w-2 h-2' : 'w-4 h-4'}
                        rounded-sm
                        ${variant === 'default' && 'bg-slate-400'}
                        ${variant === 'hit' && 'bg-red-500'}
                        ${variant === 'sunk' && 'bg-gray-600'}
                        ${variant === 'preview' && 'bg-blue-400/50'}
                    `}
                />
            ))}
        </div>
    );
}