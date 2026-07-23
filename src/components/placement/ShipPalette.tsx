"use client";
import { useMemo } from "react";



import { ShipPaletteItem } from "./ShipPaletteItem";

import { usePlacementFlow } from "@/application/placement/hooks/usePlacementFlow";

import { STANDARD_FLEET } from "@/lib/domain/ships/models/StandardFleet";

import { cn } from "@/lib/utils/utils";

export function ShipPalette() {
    const {
        availability,
        selectedShipType,
        selectShip,
    } = usePlacementFlow();

    const remainingShipTypes =
        useMemo(
            () =>
                new Set(
                    availability.remainingShipTypes,
                ),
            [availability.remainingShipTypes],
        );

    const remainingShips =
        useMemo(
            () =>
                STANDARD_FLEET.filter(ship =>
                    remainingShipTypes.has(
                        ship.type,
                    ),
                ),
            [remainingShipTypes],
        );
    
    return (
        <div 
            className={cn(
                "w-full h-full min-h-0 min-w-0 flex flex-row gap-4",
            )}
        >
            <div className="relative flex flex-row flex-wrap gap-2 sm:gap-4">
                {/* Internal Ship List */}
                    {
                        remainingShips.map(ship => (
                            <ShipPaletteItem
                                key={ship.type}
                                type={ship.type}
                                size={ship.size}
                                isSelected={
                                    selectedShipType === ship.type
                                }
                                onSelect={() =>
                                    selectShip(ship.type)
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
