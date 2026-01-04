'use client';
import React from 'react';
import { useState, useCallback, useMemo } from 'react';
import Cell from './Cell';
import { cn } from '@/lib/utils/utils'; // Utility to combine class names dynamically
import { BOARD_SIZE } from '@/lib/utils/constants';
import type { CellState, Position, Ship } from '@/lib/utils/types';

interface BoardProps {
    size?: number;                  // Board size (default 10x10)
    cells: CellState[][];           // Current state of all cells
    isPlayerBoard: boolean;         // Determines if ships should be visible
    onCellClick: (row: number, col: number) => void; // Callback for cell clicks
    ships?: Ship[];                 // List of placed ships
    forceShowShips?: boolean;       // Forces ships to be visible (debug or game over)
    disabled?: boolean;             // Prevents interaction
    className?: string;             // Custom style overrides
    hoveredCell?: Position | null;  // Externally controlled hovered cell
    onCellDrop?: (row: number, col: number, e: React.DragEvent) => void;
    onCellDragOver?: (row: number, col: number, e: React.DragEvent) => void;
    onCellDragStart?: (row: number, col: number, e: React.DragEvent) => void;
}

/**
 * Board component represents the full game grid with coordinates,
 * cells, ships, and hover interactions.
 * 
 * - Responsible for rendering Cell components with correct state.
 * - Handles hover effects across rows/columns.
 * - Displays ships depending on `isPlayerBoard` and `forceShowShips`.
 * - Includes coordinate labels for usability and testing.
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
    onCellDrop,
    onCellDragOver,
    onCellDragStart
}: BoardProps) {
    // Local hover state (used when no external hoveredCell is provided)
    const [localHoveredCell, setLocalHoveredCell] = useState<Position | null>(null);

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
                "mx-auto w-full",
                "max-w-[85vw]",
                "sm:max-w-[70vw]",
                "md:max-w-[520px]",
                "max-h-[70vh] sm:max-h-none",
                className
            )}
        >
            <div
                className="grid"
                style={{
                    gridTemplateColumns: `auto repeat(${size}, minmax(0, 1fr))`,
                }}
            >
                {/* --- Row 0: empty corner + column labels --- */}
                <div></div>
                {Array.from({ length: size }).map((_, i) => (
                    <div
                        key={`col-${i}`}
                        className="text-[10px] sm:text-xs md:text-sm text-slate-400 text-center px-1"
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
                            className="text-[10px] sm:text-xs md:text-sm text-slate-400 text-center px-1"
                        >
                            {row + 1}
                        </div>

                        {/* Individual board cells */}
                        {Array.from({ length: size }).map((_, col) => (
                            <Cell
                                key={`${row}-${col}`}
                                state={cells[row][col]}
                                position={{ row, col }}
                                onClick={() => onCellClick(row, col)}
                                disabled={disabled}
                                showShip={isPlayerBoard || forceShowShips}
                                onDrop={(e) => onCellDrop?.(row, col, e)}
                                onDragOver={(e) => onCellDragOver?.(row, col, e)}
                                onDragStart={(e) => onCellDragStart?.(row, col, e)}
                                draggable={isPlayerBoard && cells[row][col] === 'ship'}
                            />
                        ))}
                    </ React.Fragment>
                ))}
            </div>
        </div>
    );
}