"use client";
import { ShipPaletteItem } from "./ShipPaletteItem";
import { cn } from "@/lib/utils/utils";
import { ShipType } from '@/lib/domain/ships/models/ShipType';
import { BaseShip } from '@/lib/domain/ships/models/BaseShip';

interface ShipPaletteProps {
    ships: BaseShip[];
    selectedShipType: ShipType | null;
    onSelectShip: (shipType: ShipType) => void;
}

export default function ShipPalette({
    ships,
    selectedShipType,
    onSelectShip,
}: ShipPaletteProps) {
    return (
        <div className="flex-1 min-h-0 w-full">
            <div className="flex flex-col gap-2 [@media_(max-width:767px)_and_(orientation:portrait)]:flex-row flex-wrap">
                {ships.map((ship) => (
                    <ShipPaletteItem
                        key={ship.type}
                        type={ship.type}
                        size={ship.size}
                        isSelected={selectedShipType === ship.type}
                        onSelect={() => onSelectShip(ship.type)}
                    />
                ))}
            </div>
        </div>
    );
}
