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
        <div className="flex-1 min-h-0 w-full flex flex-col">
            <div className="relative flex flex-col gap-2">
                {/* Internal Ship List */}
                    {
                        ships.map(ship => (
                            <ShipPaletteItem
                                key={ship.type}
                                type={ship.type}
                                size={ship.size}
                                isSelected={
                                    selectedShipType === ship.type
                                }
                                onSelect={() =>
                                    onSelectShip(ship.type)
                                }
                            />
                        ))
                    }
            </div>
        </div>
    );
}
