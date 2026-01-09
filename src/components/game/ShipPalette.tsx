"use client";

import { useGameStore } from "@/lib/store/game-store";
import { SHIPS_CONFIG } from "@/lib/utils/constants";
import { ShipType } from "@/lib/utils/types";
import { cn } from "@/lib/utils/utils";
import { useShallow } from "zustand/react/shallow";
import { OrientationToggle } from "./OrientationToggle";

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
    layout?: 'horizontal' | 'vertical'; // Controls the orientation of the fleet list
    className?: string;                 // External layout/positioning
}

export const ShipPalette = ({ 
    className 
}: ShipPaletteProps) => {
    const { placedShips, selectedShipId, selectShip, orientation, removePlayerShip } = useGameStore(
        useShallow((state) => ({
            placedShips: state.player.ships,
            selectedShipId: state.selectedShipId,
            selectShip: state.selectShip,
            orientation: state.orientation,
            removePlayerShip: state.removePlayerShip,
        }))
    );

    const handlePaletteDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const dataStr = e.dataTransfer.getData("application/json");
        if (!dataStr) return;
        
        try {
            const data = JSON.parse(dataStr) as { id: string; source?: string };
            if (data.source === 'board') {
                removePlayerShip(data.id);
                selectShip(data.id);
            }
        } catch (err) {
            console.error("Failed to parse drop on palette", err);
        }
    };

    const handlePaletteDragOver = (e: React.DragEvent) => {
        e.preventDefault();
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
            className={cn(
                "w-full h-full min-h-0 min-w-0 flex flex-col gap-4",
                className
            )}
            onDrop={handlePaletteDrop}
            onDragOver={handlePaletteDragOver}
        >
            <div className="relative flex flex-col gap-2 sm:gap-4">
                {/* Interactive Orientation Control */}
                <div className="flex justify-between items-center px-1">
                    <OrientationToggle />
                </div>

                {/* Internal Ship List */}
                <div className={cn(
                    "flex flex-row overflow-x-auto no-scrollbar justify-start sm:justify-center items-center gap-5 sm:gap-6 px-1 py-1 w-full",
                    "md:grid md:grid-cols-1 md:gap-4 md:overflow-visible"
                )}>
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
                            
                            const ghost = document.createElement("div");
                            ghost.style.position = "absolute";
                            ghost.style.top = "-1000px";
                            ghost.style.left = "-1000px";
                            ghost.style.display = "flex";
                            ghost.style.gap = "1px"; 
                            ghost.style.padding = "2px";
                            
                            ghost.style.flexDirection = orientation === 'horizontal' ? 'row' : 'column';
                            
                            for (let i = 0; i < ship.size; i++) {
                                const seg = document.createElement("div");
                                seg.style.width = "20px"; 
                                seg.style.height = "20px";
                                seg.style.backgroundColor = "#3b82f6";
                                seg.style.border = "1px solid #60a5fa";
                                seg.style.borderRadius = "2px";
                                ghost.appendChild(seg);
                            }

                            document.body.appendChild(ghost);
                            e.dataTransfer.setDragImage(ghost, 0, 0);

                            setTimeout(() => document.body.removeChild(ghost), 0);
                        };

                        return (
                            <div
                                key={ship.id}
                                className={cn(
                                    "relative flex items-center transition-all duration-200 shrink-0",
                                    "flex-col gap-1.5 md:flex-row md:w-full md:justify-between md:gap-3 md:px-2",
                                    isPlaced ? "opacity-20 grayscale cursor-not-allowed scale-95" : "hover:scale-105"
                                )}
                            >
                                <div
                                    role="button"
                                    tabIndex={isPlaced ? -1 : 0}
                                    draggable={!isPlaced}
                                    onDragStart={handleDragStart}
                                    onClick={() => !isPlaced && selectShip(ship.id)}
                                    className={cn(
                                        "flex gap-[1px] p-[1.5px] rounded-sm cursor-pointer transition-all border shrink-0",
                                        "flex-row",
                                        isSelected
                                            ? "border-yellow-400 bg-yellow-400/20 shadow-md ring-1 ring-yellow-400/50"
                                            : "border-slate-700 bg-slate-800/40 hover:border-slate-500",
                                        isPlaced && "border-transparent bg-transparent"
                                    )}
                                    aria-label={`Select ${ship.name}, size ${ship.size}`}
                                    aria-pressed={isSelected}
                                    aria-disabled={isPlaced}
                                >
                                    {Array.from({ length: ship.size }).map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={cn(
                                                "w-2.5 h-2.5 sm:w-4 sm:h-4 rounded-[1px] transition-colors border-[0.5px]",
                                                isPlaced
                                                    ? "bg-slate-800 border-slate-700"
                                                    : isSelected
                                                    ? "bg-blue-500 border-blue-300"
                                                    : "bg-slate-600 border-slate-500"
                                            )}
                                        />
                                    ))}
                                </div>

                                <span className={cn(
                                    "text-[8px] sm:text-[10px] font-bold uppercase tracking-wider select-none shrink-0",
                                    isSelected ? "text-yellow-400" : "text-slate-500",
                                    isPlaced && "text-slate-700"
                                )}>
                                    {ship.name}
                                </span>
                            </div>

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
