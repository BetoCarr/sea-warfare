"use client";
import type { ShipType } from "@/lib/utils/types";
import { ShipSpec } from "@/lib/game-logic/ships/ship-spec";
import { useShipPlacement } from "@/application/placement/useShipPlacement";
import { useGameStore } from "@/lib/store/game-store";
import { cn } from "@/lib/utils/utils";
import { useMemo } from "react";

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
}

export const ShipPalette = ({ 
    ships,
}: ShipPaletteProps) => {

    const {
        selectedShipType,
        selectShip,
    } = useShipPlacement();

    const playerShips = useGameStore(s => s.player.ships);

    const placedTypes = useMemo(
        () => new Set(playerShips.map(s => s.type)),
        [playerShips]
    );

    return (
        <div 
            className={cn(
                "w-full h-full min-h-0 min-w-0 flex flex-col gap-4",
            )}
        >
            <div className="relative flex flex-col gap-2 sm:gap-4">
                {/* Internal Ship List */}
                <div>
                    {ships.map(ship => {

                        const isPlaced = placedTypes.has(ship.type);
                        const isSelected = selectedShipType === ship.type;
                        
                        return (
                            <button
                                key={ship.type}
                                disabled={isPlaced}
                                onClick={() => selectShip(ship.type)}
                            >
                                {ship.type}
                            </button>
                        );
                    })}
                </div>

                {/* Scroll shadows for mobile hint */}
                <div className="md:hidden pointer-events-none absolute bottom-0 right-0 h-12 w-20 bg-gradient-to-l from-slate-950 via-slate-900/80 to-transparent z-10" />
                <div className="md:hidden pointer-events-none absolute bottom-0 left-0 h-12 w-8 bg-gradient-to-r from-slate-950/50 to-transparent z-10" />
            </div>
        </div>
    );
};
