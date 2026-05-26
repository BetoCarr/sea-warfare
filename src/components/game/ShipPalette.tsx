"use client";
import type { ShipType } from '@/lib/domain/ships/models/ShipType';
import { ShipSpec } from "@/lib/domain/ships/ship-spec";
import { useGameStore } from "@/lib/store/game-store";
import { cn } from "@/lib/utils/utils";
import { useMemo } from "react";
import { ShipPaletteItem } from "./ShipPaletteItem";

/**
 * ShipPalette
 * ------------------------------------------------------------
 * Displays the available fleet configuration for the player to select.
 *
 * REFACTOR UPDATE:
 * Now renders "Visual Ship Segments" to represent the actual shape
 * and size of the ship.
 * - Subscribes to `orientation` to layout segments horizontally or vertically.
 * - This provides WYSIWYG drag-and-drop feedback.
 */

interface ShipPaletteProps {
    ships: ShipSpec[];  
    selectedShipType: ShipType | null;
    selectShip: (shipType: ShipType | null) => void;
}

export const ShipPalette = ({ 
    ships,
    selectedShipType,
    selectShip
}: ShipPaletteProps) => {

    const playerShips = useGameStore(s => s.player.ships);

    const placedTypes = useMemo(
        () => new Set(playerShips.map(s => s.type)),
        [playerShips]
    );

    return (
        <div 
            className={cn(
                "w-full h-full min-h-0 min-w-0 flex flex-row gap-4",
            )}
        >
            <div className="relative flex flex-row flex-wrap gap-2 sm:gap-4">
                {/* Internal Ship List */}
                    {ships.map(ship => {
                        const isPlaced = placedTypes.has(ship.type);
                        const isSelected = selectedShipType === ship.type;
                        
                        return (
                            <div key={ship.type} className= "mb-2 last:mb-0">
                                <ShipPaletteItem 
                                    type={ship.type}
                                    size={ship.size}
                                    isSelected={isSelected}
                                    selectShip={() => selectShip(ship.type)}
                                />
                            </div>
                        );
                    })}
                {/* Scroll shadows for mobile hint */}
                <div className="md:hidden pointer-events-none absolute bottom-0 right-0 h-12 w-20 bg-gradient-to-l from-slate-950 via-slate-900/80 to-transparent z-10" />
                <div className="md:hidden pointer-events-none absolute bottom-0 left-0 h-12 w-8 bg-gradient-to-r from-slate-950/50 to-transparent z-10" />
            </div>
        </div>
    );
};
