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
        <div
            className={cn(
                "w-full",
                "grid grid-cols-3 gap-2",

                // Mobile Landscape
                "mobile-landscape:grid-cols-2",

                // Tablet Portrait
                "tablet-portrait:flex-1 tablet-portrait:min-h-0",
                "tablet-portrait:h-full tablet-portrait:grid-rows-2",

                // Desktop
                "desktop:flex-1 desktop:min-h-0",
                "desktop:grid-cols-1 desktop:grid-rows-5",
            )}
        >
            {ships.map(({ type, size }) => (
                <ShipPaletteItem
                    key={type}
                    type={type}
                    size={size}
                    isSelected={selectedShipType === type}
                    onSelect={() => onSelectShip(type)}
                />
            ))}
        </div>
    );
}
