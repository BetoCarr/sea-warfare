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
                "w-full h-full min-h-0 min-w-0 flex flex-row gap-4",
            )}
        >
            <div className="relative flex flex-row flex-wrap gap-2 sm:gap-4">
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
                {/* Scroll shadows for mobile hint */}
                <div className="md:hidden pointer-events-none absolute bottom-0 right-0 h-12 w-20 bg-gradient-to-l from-slate-950 via-slate-900/80 to-transparent z-10" />
                <div className="md:hidden pointer-events-none absolute bottom-0 left-0 h-12 w-8 bg-gradient-to-r from-slate-950/50 to-transparent z-10" />
            </div>
        </div>
    );
}
