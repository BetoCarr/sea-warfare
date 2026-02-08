'use client';
import React from 'react';
import { useState, useCallback, useMemo } from 'react';
import Cell from './Cell';
import { cn } from '@/lib/utils/utils'; // Utility to combine class names dynamically
import { BOARD_SIZE, SHIPS_CONFIG } from '@/lib/utils/constants';
import type { CellState, Position, Ship, ShipType } from '@/lib/utils/types';
import { useShipPlacement, useShipPlacementMobileBridge } from '@/hooks/useShipPlacement';
import { useGameStore } from '@/lib/store/game-store';

interface BoardProps {
    size?: number;                  
    cells: CellState[][];           
    isPlayerBoard: boolean;         
    onCellClick: (row: number, col: number) => void; 
    ships?: Ship[];                 
    forceShowShips?: boolean;       
    disabled?: boolean;            
    className?: string;             
    hoveredCell?: Position | null; 
    onCellInteract?: (type: 'start' | 'commit' | 'hover' | 'cancel', row: number, col: number, e: any) => void;
    draggingShipId?: string | null;
}

/**
 * Board component represents the full game grid with coordinates,
 * cells, ships, and hover interactions.
 */
export default function Board({
    size = BOARD_SIZE,
    cells,
    isPlayerBoard,
    onCellClick,
    ships = [],
    forceShowShips = false,
    disabled = false,
    className,
    hoveredCell,
    onCellInteract,
    draggingShipId
}: BoardProps) {
    // Local hover state (used when no external hoveredCell is provided)
    const [localHoveredCell, setLocalHoveredCell] = useState<Position | null>(null);

    const placementCore = useShipPlacement();
    const placementMobileBridge = useShipPlacementMobileBridge(placementCore);

    // Decide if ships should be displayed
    const showShips = isPlayerBoard || forceShowShips;
    
    // Merge external and local hover sources
    const effectiveHoveredCell = hoveredCell || localHoveredCell;

    /**
     * Handle user clicking a cell.
     * - Ignores interaction if board is disabled.
     * - Passes position to parent callback.
     */
    const handleCellClick = useCallback((row: number, col: number) => {
        if (disabled) return;
        onCellClick(row, col);
    }, [disabled, onCellClick]);

    /**
     * Handle hover entering a cell.
     * - Updates local hovered state if not disabled.
     */
    const handleCellHover = useCallback((row: number, col: number) => {
        if (!disabled) {
            setLocalHoveredCell({ row, col });
        }
    }, [disabled]);

    /**
     * Reset hover when leaving a cell.
     */
    const handleCellLeave = useCallback(() => {
        setLocalHoveredCell(null);
    }, []);

    /**
     * Generate column coordinate labels (A, B, C...).
     */
    const columnLabels = useMemo(() => {
        return Array.from({ length: size }, (_, i) => String.fromCharCode(65 + i));
    }, [size]);

    /**
     * Generate row coordinate labels (1, 2, 3...).
     */
    const rowLabels = useMemo(() => {
        return Array.from({ length: size }, (_, i) => i + 1);
    }, [size]);

    /**
     * Check if a given cell is currently hovered.
     */
    const isCellHovered = useCallback((row: number, col: number) => {
        return effectiveHoveredCell?.row === row && effectiveHoveredCell?.col === col;
    }, [effectiveHoveredCell]);

    /**
     * Look up additional info for a cell:
     * - Whether it belongs to a ship.
     * - Which ship it belongs to.
     * - Whether it's the starting position of the ship.
     */

    const getCellInfo = useCallback((row: number, col: number) => {
        const shipInCell = ships.find(ship => {
        if (!ship.position) return false;
        
        const { row: shipRow, col: shipCol } = ship.position;
        const { orientation, size: shipSize } = ship;
        
        if (orientation === 'horizontal') {
            return row === shipRow && col >= shipCol && col < shipCol + shipSize;
        } else {
            return col === shipCol && row >= shipRow && row < shipRow + shipSize;
        }
            });
        return {
            hasShip: !!shipInCell,
            ship: shipInCell,
            isShipStart: shipInCell?.position?.row === row && shipInCell?.position?.col === col
        };
    }, [ships]);

    // GhostCellFunction
    const ghostPreview = useMemo(() => {
        // 1. Priority: Core Hover/Drag Preview (calculated in hook)
        if (placementCore.state.hoverPreview) {
            return {
                cells: placementCore.state.hoverPreview.items,
                isValid: placementCore.state.hoverPreview.isValid,
            };
        }

        // 2. Fallback: Mobile Pending Cell
        if (!placementMobileBridge.mobileState.pendingCell) return null;
        if (!placementCore.state.selectedShipId) return null;

        const shipId = placementCore.state.selectedShipId;
        const shipType = shipId.split('-')[0] as ShipType;
        const config = SHIPS_CONFIG[shipType];
        if (!config) return null;

        const { row, col } = placementMobileBridge.mobileState.pendingCell;

        const ship: Ship = {
            id: shipId,
            type: shipType,
            size: config.size,
            position: { row, col },
            orientation: placementCore.state.orientation,
            hits: [],
            isSunk: false,
        };

        const result = useGameStore
            .getState()
            .placePlayerShip(ship, { dryRun: true });

        const cells = Array.from({ length: config.size }).map((_, i) => ({
            row: ship.orientation === 'horizontal' ? row : row + i,
            col: ship.orientation === 'horizontal' ? col + i : col,
        }));

        return {
            cells,
            isValid: result.success,
        };
    }, [
        placementMobileBridge.mobileState.pendingCell,
        placementCore.state.selectedShipId,
        placementCore.state.orientation,
        placementCore.state.hoverPreview
    ]);

    const isGhostCell = (row: number, col: number) => {
        // Mobile preview
        if (
            ghostPreview?.cells.some(
                (g) => g.row === row && g.col === col
            )
        ) {
            return true;
        }

        // Desktop drag (existing behavior)
        return getCellInfo(row, col).ship?.id === draggingShipId;
    };

    /**
     * Decide what visual state a cell should display:
     * - Priority to explicit states (hit, miss, sunk). 
     * - Otherwise, show ship if present and visible.
     * - Defaults to empty.
     */
    const getCellDisplayState = useCallback((row: number, col: number): CellState => {
        const currentState = cells[row]?.[col] || 'empty';
        const cellInfo = getCellInfo(row, col);
        if (currentState === 'hit' || currentState === 'miss' || currentState === 'sunk') {
            return currentState;
        }
        
        if (cellInfo.hasShip && showShips) {
            return 'ship';
        }
        
        return 'empty';
    }, [cells, getCellInfo, showShips]);

    return (
        <div
            className={cn(
                "mx-auto w-[90vw] aspect-square",
                "max-w-[320px] max-h-[40vh]",
                "sm:max-w-[380px] sm:max-h-[45vh]",
                "md:max-w-[450px] md:max-h-[65vh]",
                className
            )}
        >
            <div
                className={cn(
                    "grid",
                    "gap-[6px] sm:gap-[4px] md:gap-[3px]"
                )}
                style={{
                    gridTemplateColumns: `auto repeat(${size}, minmax(0, 1fr))`,
                }}
            >
                {/* --- Row 0: empty corner + column labels --- */}
                <div></div>
                {Array.from({ length: size }).map((_, i) => (
                    <div
                        key={`col-${i}`}
                        className="text-[10px] sm:text-xs md:text-sm text-slate-400 text-center"
                    >
                        {String.fromCharCode(65 + i)}
                    </div>
                ))}

                {/* --- Rows and cells --- */}
                {Array.from({ length: size }).map((_, row) => (
                    <React.Fragment key={row}>
                        {/* Row number label */}
                        <div
                            key={`row-${row}`}
                            className="text-[10px] sm:text-xs md:text-sm text-slate-400 text-center"
                        >
                            {row + 1}
                        </div>

                        {/* Individual board cells */}
                        {Array.from({ length: size }).map((_, col) => (
                            <Cell
                                key={`${row}-${col}`}
                                state={cells[row][col]}
                                position={{ row, col }}
                                onPress={(pos) =>
                                    placementMobileBridge.mobileHandlers.onCellTap(pos.row, pos.col)
                                }
                                disabled={disabled}
                                showShip={isPlayerBoard || forceShowShips}
                                draggable={isPlayerBoard && cells[row][col] === 'ship'}
                                isGhost={isGhostCell(row, col)}
                            />
                        ))}
                    </ React.Fragment>
                ))}
            </div>
        </div>
    );
}