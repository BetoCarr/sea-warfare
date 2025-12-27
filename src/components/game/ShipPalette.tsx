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
 *
 * REFACTOR UPDATE:
 * Now renders "Visual Ship Segments" to represent the actual shape
 * and size of the ship.
 * - Subscribes to `orientation` to layout segments horizontally or vertically.
 * - This provides WYSIWYG drag-and-drop feedback.
 */
export const ShipPalette = () => {
    const { placedShips, selectedShipId, selectShip, orientation, removePlayerShip } = useGameStore(
        useShallow((state) => ({
            placedShips: state.player.ships,
            selectedShipId: state.selectedShipId,
            selectShip: state.selectShip,
            orientation: state.orientation,
            removePlayerShip: state.removePlayerShip,
        }))
    );

    // UX Decision: Always display ships horizontally in the palette (Toolbar)
    // to prevent the Header height from jumping when toggling orientation.
    // The orientation setting controls the *placement* and *dragged ghost*, not the palette view.
    const isHorizontal = true;

    const handlePaletteDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const dataStr = e.dataTransfer.getData("application/json");
        if (!dataStr) return;
        
        try {
            const data = JSON.parse(dataStr) as { id: string; source?: string };
            if (data.source === 'board') {
                removePlayerShip(data.id);
                // Optionally select it ready for placement again
                selectShip(data.id);
            }
        } catch (err) {
            console.error("Failed to parse drop on palette", err);
        }
    };

    const handlePaletteDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Enable drop
        e.dataTransfer.dropEffect = "move";
    };

    // Generate flat list of ships from config
    const fleet = Object.entries(SHIPS_CONFIG).map(([type, config]) => {
        return {
            id: `${type}-1`,
            type: type as ShipType,
            name: config.name,
            size: config.size
        };
    });

    return (
        <div 
            className="flex flex-wrap gap-4 justify-center items-center py-1 w-full rounded-md border-2 border-transparent transition-colors hover:border-slate-700/50"
            onDrop={handlePaletteDrop}
            onDragOver={handlePaletteDragOver}
        >
            {fleet.map((ship) => {
                const isPlaced = placedShips.some((s) => s.id === ship.id);
                const isSelected = selectedShipId === ship.id;

                const handleDragStart = (e: React.DragEvent) => {
                    if (isPlaced) {
                        e.preventDefault();
                        return;
                    }
                    selectShip(ship.id);

                    e.dataTransfer.setData(
                        "application/json",
                        JSON.stringify({
                            id: ship.id,
                            type: ship.type,
                            size: ship.size
                        })
                    );
                    e.dataTransfer.effectAllowed = "copy";
                    
                    // Optional: Custom ghost image could be set here, but
                    // native behavior of dragging the visual element usually works well
                    // if the element shape matches the target.
                };

                return (
                    <div
                        key={ship.id}
                        className={clsx(
                            "relative flex flex-col items-center gap-1 transition-all duration-200",
                            isPlaced ? "opacity-40 grayscale" : "hover:scale-105"
                        )}
                    >
                        {/* Container for the visual ship blocks */}
                        <div
                            role="button"
                            tabIndex={isPlaced ? -1 : 0}
                            draggable={!isPlaced}
                            onDragStart={handleDragStart}
                            onClick={() => !isPlaced && selectShip(ship.id)}
                            onKeyDown={(e) => {
                                if ((e.key === 'Enter' || e.key === ' ') && !isPlaced) {
                                    selectShip(ship.id);
                                }
                            }}
                            className={clsx(
                                "flex gap-[1px] p-[2px] rounded cursor-pointer transition-all border",
                                isHorizontal ? "flex-row" : "flex-col",
                                isSelected
                                    ? "border-yellow-400 bg-yellow-400/20 shadow-[0_0_10px_rgba(250,204,21,0.3)]"
                                    : "border-transparent hover:bg-slate-700/50",
                                isPlaced && "cursor-not-allowed border-transparent"
                            )}
                            aria-label={`Select ${ship.name}, size ${ship.size}`}
                            aria-pressed={isSelected}
                            aria-disabled={isPlaced}
                        >
                            {/* Render segments */}
                            {Array.from({ length: ship.size }).map((_, idx) => (
                                <div
                                    key={idx}
                                    className={clsx(
                                        "w-5 h-5 rounded-sm shadow-sm transition-colors border",
                                        isPlaced
                                            ? "bg-slate-700 border-slate-600"
                                            : isSelected
                                            ? "bg-blue-500 border-blue-400"
                                            : "bg-slate-600 border-slate-500"
                                    )}
                                />
                            ))}
                        </div>

                        {/* Label below */}
                        <span className="text-[10px] font-medium text-slate-400 select-none">
                            {ship.name}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};
