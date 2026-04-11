'use client';
import React from 'react';
import { useState, useCallback, useMemo } from 'react';
import Cell from './Cell';
import { cn } from '@/lib/utils/utils'; // Utility to combine class names dynamically
import { BOARD_SIZE, SHIPS_CONFIG } from '@/lib/utils/constants';
import type { CellState, Position, Ship, ShipType } from '@/lib/utils/types';
import type { BoardViewModel } from '@/application/board/board-types';


interface BoardProps {
    boardVM: BoardViewModel; // 👈 nuevo
    // size?: number;                  
    // cells: CellState[][];           
    // isPlayerBoard: boolean;         
    // onCellClick: (row: number, col: number) => void; 
    // forceShowShips?: boolean;       
    // disabled?: boolean;            
    // className?: string;             
    // hoveredCell?: Position | null; 
    
}

/**
 * Board component represents the full game grid with coordinates,
 * cells, ships, and hover interactions.
 */
export default function Board({
    boardVM,
    // size = BOARD_SIZE,
    // cells,
    // isPlayerBoard,
    // onCellClick,
    // forceShowShips = false,
    // disabled = false,
    // className,
    // hoveredCell,
}: BoardProps) {
    // Local hover state (used when no external hoveredCell is provided)
    const [localHoveredCell, setLocalHoveredCell] = useState<Position | null>(null);
    console.log('BoardVM', boardVM);
    const size = boardVM.size;

    return (
        <div
            className={cn(
                "mx-auto w-[90vw] aspect-square",
                "max-w-[320px] max-h-[40vh]",
                "sm:max-w-[380px] sm:max-h-[45vh]",
                "md:max-w-[450px] md:max-h-[65vh]",
                // className
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
            
                {boardVM.cells.map((rowData, row) => (
                    <React.Fragment key={row}>
                        {/* Row number */}
                        <div className="text-[10px] sm:text-xs md:text-sm text-slate-400 text-center">
                            {row + 1}
                        </div>

                        {/* Cells */}
                        {rowData.map((vmCell, col) => (
                            <p>
                                holsa
                            </p>
                            // <Cell
                            //     key={`${row}-${col}`}
                            //     // state={vmCell.state}
                            //     position={{ row, col }}
                            //     // disabled={disabled}
                            //     // showShip={isPlayerBoard || forceShowShips}
                            //     // draggable={isPlayerBoard && vmCell.state === 'ship'}
                            //     // isPreview={vmCell.isPreview}
                            //     // isGhost={vmCell.isGhost}
                            //     // isHovered={vmCell.isHovered}
                            // />
                        ))}
                    </React.Fragment>
                ))}
            </div>
        </div>  
    );
}