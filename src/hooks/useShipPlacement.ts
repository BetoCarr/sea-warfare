"use client";

import { useState, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useGameStore } from "@/lib/store/game-store";
import { GamePhase } from "@/lib/store/game-types";
import { ShipType, Ship, Position } from "@/lib/utils/types";
import { SHIPS_CONFIG } from "@/lib/utils/constants";
import css from "styled-jsx/css";

/**
 * useShipPlacement
 * ------------------------------------------------------------
 * Domain hook that encapsulates all ship placement logic.
 * Decouples the Board and Cell components from the GameStore
 * and the specific event handling (Drag vs Click).
 */
/**
 * useShipPlacement
 * ------------------------------------------------------------
 * PURE DOMAIN CORE.
 * Handles state and business rules for ship movement.
 * Zero dependency on DOM events (DragEvent, etc.).
 */
export const useShipPlacement = () => {
    const [draggingShipId, setDraggingShipId] = useState<string | null>(null);
    const [originalPosition, setOriginalPosition] = useState<Position | null>(null);
    const [originalOrientation, setOriginalOrientation] = useState<Ship['orientation'] | null>(null);
    const [hoverPreview, setHoverPreview] = useState<{
        items: Position[]; // Occupied cells
        isValid: boolean;
    } | null>(null);

    const {
        phase,
        player,
        orientation,
        selectedShipId,
        placePlayerShip,
        removePlayerShip,
        selectShip,
    } = useGameStore(
        useShallow((state) => ({
            phase: state.phase,
            player: state.player,
            orientation: state.orientation,
            selectedShipId: state.selectedShipId,
            placePlayerShip: state.placePlayerShip,
            removePlayerShip: state.removePlayerShip,
            selectShip: state.selectShip,
        }))
    );

    const startMove = useCallback((row: number, col: number) => {
        if (phase !== GamePhase.PLACEMENT) return null;

        const ship = player.ships.find(s => {
            if (!s.position) return false;
            const { row: sr, col: sc } = s.position;
            const size = s.size;
            return s.orientation === 'horizontal'
                ? (row === sr && col >= sc && col < sc + size)
                : (col === sc && row >= sr && row < sr + size);
        });

        if (ship && ship.position) {
            setDraggingShipId(ship.id);
            setOriginalPosition(ship.position);
            setOriginalOrientation(ship.orientation);
            selectShip(ship.id);
            return ship;
        }
        return null;
    }, [phase, player.ships, selectShip]);

    const canPlaceShip = useCallback(
        (row: number, col: number) => {
            if (!selectedShipId) return false;

            const shipType = selectedShipId.split('-')[0] as ShipType;
            const shipConfig = SHIPS_CONFIG[shipType];
            if (!shipConfig) return false;

            const ship: Ship = {
                id: selectedShipId,
                type: shipType,
                size: shipConfig.size,
                position: { row, col },
                orientation,
                hits: [],
                isSunk: false
            };

            return placePlayerShip(ship, { dryRun: true }).success;
        },
        [selectedShipId, orientation, placePlayerShip]
    );

    const updateGhost = useCallback((row: number, col: number) => {
        if (!selectedShipId) {
            setHoverPreview(null);
            return;
        }

        const shipType = selectedShipId.split('-')[0] as ShipType;
        const shipConfig = SHIPS_CONFIG[shipType];
        if (!shipConfig) return;

        // Use core store logic for dry run
        // We could use previewPlacement here if we had access to board ships, 
        // but placePlayerShip({ dryRun: true }) is also a valid valid approach given the hook structure
        // However, user specifically asked to use "previewPlacement" or suggested domain logic.
        // Let's stick to using the existing store action for dryRun as it creates the 'ghost' concept effectively
        
        const ship: Ship = {
            id: selectedShipId,
            type: shipType,
            size: shipConfig.size,
            position: { row, col },
            orientation,
            hits: [],
            isSunk: false
        };

        const result = placePlayerShip(ship, { dryRun: true });
        
        // Calculate cells for the ghost
        const items: Position[] = [];
        for (let i = 0; i < ship.size; i++) {
            if (orientation === 'horizontal') {
                items.push({ row, col: col + i });
            } else {
                items.push({ row: row + i, col });
            }
        }

        setHoverPreview({
            items,
            isValid: result.success
        });
    }, [selectedShipId, orientation, placePlayerShip]);

    const commitMove = useCallback((row: number, col: number) => {
        if (phase !== GamePhase.PLACEMENT) return;
        if (!selectedShipId) return;

        const shipId = selectedShipId;
        const shipType = shipId.split('-')[0] as ShipType;
        const shipConfig = SHIPS_CONFIG[shipType];
        
        if (!shipConfig) return;

        const shipSize = shipConfig.size;
        const targetOrientation = originalOrientation ?? orientation;

        // If it was already on the board (repositioning), remove it first
        if (originalPosition) {
            removePlayerShip(shipId);
        }

        const newShip: Ship = {
            id: shipId,
            type: shipType,
            size: shipSize,
            position: { row, col },
            orientation: targetOrientation,
            hits: new Array(shipSize).fill(false),
            isSunk: false
        };

        const result = placePlayerShip(newShip);

        // Rollback if placement fails and it was a repositioning
        if (!result.success && originalPosition && originalOrientation) {
            placePlayerShip({
                ...newShip,
                position: originalPosition,
                orientation: originalOrientation
            });
        }

        setDraggingShipId(null);
        setOriginalPosition(null);
        setOriginalOrientation(null);
    }, [phase, selectedShipId, orientation, originalOrientation, originalPosition, placePlayerShip, removePlayerShip]);

    const cancelMove = useCallback(() => {
        setDraggingShipId(null);
        setOriginalPosition(null);
        setOriginalOrientation(null);
        setHoverPreview(null);
    }, []);

    const removeShip = useCallback((id: string) => {
        removePlayerShip(id);
        setDraggingShipId(null);
        setOriginalPosition(null);
        setOriginalOrientation(null);
    }, [removePlayerShip]);

    return {
        state: {
            draggingShipId,
            selectedShipId,
            orientation,
            phase,
            hoverPreview
        },
        actions: {
            startMove,
            commitMove,
            cancelMove,
            selectShip,
            removeShip,
            canPlaceShip,
            updateGhost
        }
    };
};

/**
 * useShipPlacementBridge
 * ------------------------------------------------------------
 * DOM ADAPTER.
 * Connects the pure domain core to specific browser APIs (DragEvent).
 */
export const useShipPlacementBridge = (core: ReturnType<typeof useShipPlacement>) => {
    
    const dragHandlers = {
        onDragStart: (row: number, col: number, e: React.DragEvent) => {
            const ship = core.actions.startMove(row, col);
            if (ship) {
                e.dataTransfer.setData("text/plain", ship.id);
                e.dataTransfer.effectAllowed = "move";

                // Ghost Image logic (DOM specific)
                const ghost = document.createElement("div");
                ghost.className = "flex items-center gap-1 opacity-80 pointer-events-none";
                ghost.style.position = "absolute";
                ghost.style.top = "-1000px";
                for (let i = 0; i < ship.size; i++) {
                    const seg = document.createElement("div");
                    seg.className = "w-8 h-8 bg-blue-500 border border-blue-400 rounded-sm";
                    ghost.appendChild(seg);
                }
                document.body.appendChild(ghost);
                e.dataTransfer.setDragImage(ghost, 16, 16);
                setTimeout(() => document.body.removeChild(ghost), 0);
            } else {
                e.preventDefault();
            }
        },
        onDrop: (row: number, col: number, e: React.DragEvent) => {
            e.preventDefault();
            // We no longer need to parse JSON. 
            // The core already knows which ship is active via selectedShipId.
            core.actions.commitMove(row, col);
        },
        onDragOver: (row: number, col: number, e: React.DragEvent) => {
            if (core.state.phase === GamePhase.PLACEMENT) {
                e.preventDefault();
                core.actions.updateGhost(row, col);
            }
        },
        onDragEnd: () => core.actions.cancelMove()
    };

    const interactionHandlers = {
        onClick: (row: number, col: number) => {
            if (core.state.selectedShipId) {
                core.actions.commitMove(row, col);
            } else {
                core.actions.startMove(row, col);
            }
        },
        /**
         * Desktop bridge for starting a drag from the palette
         */
        handlePaletteDragStart: (shipId: string, e: React.DragEvent) => {
            core.actions.selectShip(shipId);

            const shipType = shipId.split('-')[0] as ShipType;
            const shipConfig = SHIPS_CONFIG[shipType];
            if (!shipConfig) return;

            e.dataTransfer.setData("text/plain", shipId);
            e.dataTransfer.effectAllowed = "copy";

            // Visual Ghost (DOM specific logic moved here)
            const ghost = document.createElement("div");
            ghost.className = "flex items-center gap-1 opacity-80 pointer-events-none";
            ghost.style.position = "absolute";
            ghost.style.top = "-1000px";
            
            const isHorizontal = core.state.orientation === 'horizontal';
            ghost.style.flexDirection = isHorizontal ? 'row' : 'column';

            for (let i = 0; i < shipConfig.size; i++) {
                const seg = document.createElement("div");
                seg.className = "w-8 h-8 bg-blue-500 border border-blue-400 rounded-sm";
                ghost.appendChild(seg);
            }
            document.body.appendChild(ghost);
            e.dataTransfer.setDragImage(ghost, 16, 16);
            setTimeout(() => document.body.removeChild(ghost), 0);
        },
        /**
         * For dropping a ship back into the palette (un-placing)
         */
        onPaletteDrop: (e: React.DragEvent) => {
            e.preventDefault();
            // No need to parse JSON. 
            // If there's an active selection, we remove it.
            if (core.state.selectedShipId) {
                core.actions.removeShip(core.state.selectedShipId);
            }
        }
    };

    return {
        dragHandlers,
        interactionHandlers
    };
};

/**
 * useShipPlacementMobileBridge
 * ------------------------------------------------------------
 * MOBILE ADAPTER.
 * Handles tap-based flows (Tap ship -> Tap cell -> Confirm).
 * Manages only UI-specific pending state.
 */
export const useShipPlacementMobileBridge = (core: ReturnType<typeof useShipPlacement>) => {
    const [pendingCell, setPendingCell] = useState<Position | null>(null);

    const mobileHandlers = {
        /** Tap on a cell */
        onCellTap: (row: number, col: number) => {
            if (core.state.phase !== GamePhase.PLACEMENT) return;

            if (!core.actions.canPlaceShip(row, col)) {
                console.log('No se puede colocar el barco en esta posición');
                return; // o feedback visual
            }

            // No hay barco seleccionado → intentar seleccionar desde el board
            if (!core.state.selectedShipId) {
                core.actions.startMove(row, col);
                return;
            }

            // Hay barco seleccionado → solo guardar destino
            setPendingCell({ row, col });
            console.log('Pending cell:', row, col);
        },


        /** Tap on a ship in the palette */
        onShipTap: (shipId: string) => {
            core.actions.selectShip(shipId);
            setPendingCell(null);
        },

        /** Confirm placement button */
        confirmPlacement: () => {
            if (!pendingCell) return;
            core.actions.commitMove(pendingCell.row, pendingCell.col);
            setPendingCell(null);
        },

        /** Cancel placement */
        cancelPlacement: () => {
            core.actions.cancelMove();
            setPendingCell(null);
        }
    };

    return {
        mobileHandlers,
        mobileState: {
            pendingCell,
            hasSelection: Boolean(core.state.selectedShipId)
        }
    };
};
