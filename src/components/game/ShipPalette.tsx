"use client";
import { ShipSpec } from "@/lib/game-logic/ships/ship-spec";
import { cn } from "@/lib/utils/utils";

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
    selectedShipId: string | null;
    placedShipIds: string[];
    onShipSelect: (shipId: string) => void;
}

export const ShipPalette = ({ 
    ships,
    selectedShipId,
    placedShipIds,
    onShipSelect
}: ShipPaletteProps) => {

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
                        const isPlaced = placedShipIds.includes(ship.id);
                        const isSelected = selectedShipId === ship.id;

                        return (
                            <button
                                key={ship.id}
                                disabled={isPlaced}
                                onClick={() => onShipSelect(ship.id)}
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
