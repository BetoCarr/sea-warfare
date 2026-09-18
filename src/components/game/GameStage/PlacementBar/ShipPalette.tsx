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
        <>
            {ships.map(({ type, size }) => (
                <ShipPaletteItem
                    key={type}
                    type={type}
                    size={size}
                    isSelected={selectedShipType === type}
                    onSelect={() => onSelectShip(type)}
                />
            ))}
        </>
    );
}
