'use client';

import { useState, useCallback, useMemo } from 'react';
import Cell from './Cell';
import { cn } from '@/lib/utils/utils'; // Utility to combine class names dynamically
import { BOARD_SIZE } from '@/lib/utils/constants';
import type {CellState, Position, Ship } from '@/lib/utils/types';

interface BoardProps {
    size?: number;                  // Board size (default 10x10)
    cells: CellState[][];           // Current state of all cells
    isPlayerBoard: boolean;         // Determines if ships should be visible
    onCellClick: (row: number, col: number) => void; // Callback for cell clicks
    ships?: Ship[];                 // List of placed ships
    forceShowShips?: boolean;       // Forces ships to be visible (debug or game over)
    disabled?: boolean;             // Prevents interaction
    title?: string;                 // Optional board title
    className?: string;             // Custom style overrides
    hoveredCell?: Position | null;  // Externally controlled hovered cell
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
    title,
    className,
    hoveredCell
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
        
        // Si la celda tiene estado hit, miss, o sunk, mostrar ese estado
        if (currentState === 'hit' || currentState === 'miss' || currentState === 'sunk') {
            return currentState;
        }
        
        // Si hay un barco y debemos mostrarlo
        if (cellInfo.hasShip && showShips) {
            return 'ship';
        }
        
        return 'empty';
    }, [cells, getCellInfo, showShips]);

    return (
        <div className={cn("inline-block", className)}>
            {/* Optional board title */}
            {title && (
                <h3 className="text-lg font-semibold mb-3 text-center text-slate-800">
                    {title}
                </h3>
            )}
        
            {/* Board container with border and shadow */}
            <div className="bg-white rounded-lg shadow-lg p-4 border-2 border-slate-200">
                {/* Column labels (A, B, C...) */}
                <div className="grid mb-2" style={{ gridTemplateColumns: `2rem repeat(${size}, 2rem)` }}>
                    <div></div> {/* Empty top-left corner */}
                    {columnLabels.map((label) => (
                        <div
                            key={label}
                            className="text-center text-sm font-semibold text-slate-600 h-8 flex items-center justify-center"
                        >
                            {label}
                        </div>
                    ))}
                </div>

                {/* Main grid: row labels + cells */}
                <div className="grid gap-1" style={{ gridTemplateColumns: `2rem repeat(${size}, 2rem)` }}>
                    {Array.from({ length: size }, (_, rowIndex) => (
                        <div key={`row-${rowIndex}`} className="grid grid-cols-[2rem_repeat(size,_2rem)] items-center">
                            {/* Row label (1, 2, 3...) */}
                            <div
                                key={`row-label-${rowIndex}`}
                                className="text-center text-sm font-semibold text-slate-600 w-8 h-8 flex items-center justify-center"
                            >
                                {rowLabels[rowIndex]}
                            </div>
                            
                            {/* Row cells */}
                            {Array.from({ length: size }, (_, colIndex) => (
                                <div
                                    key={`cell-${rowIndex}-${colIndex}`}
                                    onMouseEnter={() => handleCellHover(rowIndex, colIndex)}
                                    onMouseLeave={handleCellLeave}
                                    className="relative"
                                >
                                    <Cell
                                        state={getCellDisplayState(rowIndex, colIndex)}
                                        position={{ row: rowIndex, col: colIndex }}
                                        onClick={() => handleCellClick(rowIndex, colIndex)}
                                        disabled={disabled}
                                        showShip={showShips}
                                        isHovered={isCellHovered(rowIndex, colIndex)}
                                        className={cn(
                                        "transition-all duration-200",
                                        
                                        // Highlight row/column when hovered
                                        effectiveHoveredCell && (
                                            effectiveHoveredCell.row === rowIndex || 
                                            effectiveHoveredCell.col === colIndex
                                        ) && "ring-1 ring-blue-300 ring-opacity-50",
                                        
                                        // Different border color for player vs enemy
                                        isPlayerBoard 
                                            ? "border-blue-400" 
                                            : "border-red-400",
                                        )}
                                    />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                {/* Board info / stats (debug-friendly) */}
                <div className="mt-3 text-xs text-slate-500 text-center">
                    {isPlayerBoard ? "Tu tablero" : "Tablero enemigo"} • 
                    {ships.length} barco{ships.length !== 1 ? 's' : ''} • 
                    {size}×{size}
                    {disabled && " • Deshabilitado"}
                </div>
            </div>
        </div>
    );
}

/**
 * BoardStats component shows a compact summary of the board:
 * - Remaining vs total ships.
 * - Total hits and misses.
 * 
 * Useful for side panels, scoreboards, or debugging.
 */
interface BoardStatsProps {
    ships: Ship[];
    totalHits: number;
    totalMisses: number;
}

export function BoardStats({ ships, totalHits, totalMisses }: BoardStatsProps) {
    const shipsRemaining = ships.filter(ship => !ship.isSunk).length;
    const shipsTotal = ships.length;
    
    return (
        <div className="bg-slate-100 rounded-lg p-3 text-sm">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="font-semibold text-slate-700">Barcos</p>
                    <p className="text-slate-600">{shipsRemaining}/{shipsTotal} activos</p>
                </div>
                <div>
                    <p className="font-semibold text-slate-700">Disparos</p>
                    <p className="text-slate-600">
                        <span className="text-red-600">{totalHits}</span> impactos • 
                        <span className="text-blue-600">{totalMisses}</span> fallos
                    </p>
                </div>
            </div>
        </div>
    );
}