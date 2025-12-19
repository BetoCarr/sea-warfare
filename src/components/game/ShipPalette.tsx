"use client";

import { useGameStore } from "@/lib/store/game-store";
import { SHIPS_CONFIG } from "@/lib/utils/constants";
import { ShipType } from "@/lib/utils/types";
import clsx from "clsx";
import { useShallow } from "zustand/react/shallow";

/**
 * ShipPalette
 * ------------------------------------------------------------
 * Displays the available fleet configuration for the player to select.
 * Since player state starts with an empty ship list (only placed ships),
 * this component iterates over the static SHIPS_CONFIG to render the buttons.
 *
 * It checks against the `player.ships` store to determine if a ship
 * has already been placed (is disabled).
 */
export const ShipPalette = () => {
    const { placedShips, selectedShipId, selectShip } = useGameStore(
        useShallow((state) => ({
            placedShips: state.player.ships,
            selectedShipId: state.selectedShipId,
            selectShip: state.selectShip,
        }))
    );

    // Generate flat list of ships from config
    // We assume count=1 for MVP. logic can be expanded for multiple ships of same type
    const fleet = Object.entries(SHIPS_CONFIG).map(([type, config]) => {
        return {
            id: `${type}-1`, // Deterministic ID: e.g. "carrier-1"
            type: type as ShipType,
            name: config.name,
            size: config.size
        };
    });

    return (
        <div className="flex flex-wrap gap-2 sm:flex-row mb-4 justify-center">
            {fleet.map((ship) => {
                // Check if this specific ship ID is already on the board
                const isPlaced = placedShips.some((s) => s.id === ship.id);
                const isSelected = selectedShipId === ship.id;

                return (
                    <button
                        key={ship.id}
                        disabled={isPlaced}
                        onClick={() => selectShip(ship.id)}
                        className={clsx(
                            "flex items-center justify-center px-3 py-2 rounded transition-all border text-sm font-medium",
                            isPlaced
                                ? "bg-slate-800 text-slate-500 cursor-not-allowed border-transparent opacity-50"
                                : isSelected
                                ? "bg-[var(--color-primary)] text-white border-[var(--color-primary-hover)] shadow-[0_0_10px_rgba(37,99,235,0.5)] scale-105"
                                : "bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600 hover:border-slate-500"
                        )}
                        aria-label={`Select ${ship.name}, size ${ship.size}`}
                        aria-pressed={isSelected}
                        aria-disabled={isPlaced}
                    >
                        <span>{ship.name}</span>
                        <span className="ml-2 text-xs opacity-70 bg-black/20 px-1.5 py-0.5 rounded">
                            {ship.size}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};
