"use client";

import { useGameStore } from "@/lib/store/game-store";
import { SHIPS_CONFIG } from "@/lib/utils/constants";
import { ShipType } from "@/lib/utils/types";
import { cn } from "@/lib/utils/utils";
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
                "transition-all duration-500 ease-in-out flex-none",
                // Mobile: Flex Flow (Bottom area)
                "relative w-full p-4 bg-slate-900 border-t border-slate-700/30",
                "pb-[max(1rem,env(safe-area-inset-bottom))]",
                // Desktop/Tablet: Floating Sidebar Overlay (md+)
                "md:fixed md:z-50 md:bottom-auto md:top-1/2 md:left-auto md:right-8 md:-translate-y-1/2",
                "md:w-64 md:p-6 md:rounded-[2rem] md:border md:border-slate-700/40 md:bg-slate-900/60 md:backdrop-blur-xl md:shadow-2xl",
                className
            )}
            onDrop={handlePaletteDrop}
            onDragOver={handlePaletteDragOver}
        >
            {/* Visual Handle - Hidden on Desktop, subtle on Mobile */}
            <div className="w-8 h-1 bg-slate-800 rounded-full mx-auto mb-4 md:hidden" />
            
            <div className="flex flex-col gap-4">
                {/* Header Information */}
                <div className="flex justify-between items-center px-1">
                    <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Fleet Command</h3>
                    <div className="flex items-center gap-2 text-[9px] text-slate-600 font-mono">
                        <span className="bg-slate-800/50 px-1 rounded border border-slate-700/30">R</span>
                        <span className="italic hidden sm:inline">ROTATE</span>
                    </div>
                </div>

                {/* Internal Ship List */}
                <div className={cn(
                    "flex",
                    "flex-row overflow-x-auto no-scrollbar justify-start sm:justify-center items-center gap-6 px-4 py-2 w-full",
                    "md:flex-col md:items-stretch md:gap-5 md:px-0 md:py-0 md:overflow-visible"
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
                                    "flex-col gap-2 md:flex-row md:w-full md:justify-between md:gap-3 md:px-2",
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
                                                "w-3 h-3 sm:w-4 sm:h-4 rounded-[1px] transition-colors border-[0.5px]",
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
                                    "text-[9px] sm:text-[10px] font-bold uppercase tracking-widest select-none shrink-0",
                                    isSelected ? "text-yellow-400" : "text-slate-500",
                                    isPlaced && "text-slate-700"
                                )}>
                                    {ship.name}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
