'use client';
import React from 'react';

import Cell from './Cell';
import { cn } from '@/lib/utils/utils';

import type { BoardViewModel } from '@/application/board/board-types';
import type { BoardCellInteraction } from '@/application/placement/interactions/placement-interaction.types';
import type { Position } from '@/lib/domain/shared/models/Position';

interface BoardProps {
    boardVM: BoardViewModel;

    interactive?: boolean;

    onCellHover?: (
        position: Position,
    ) => void;

    onCellLeave?: () => void;

    onCellPress?: (
        interaction: BoardCellInteraction
    ) => void;
}

/**
 * Board component represents the full game grid with coordinates,
 * cells, ships, and hover interactions.
 */
export default function Board({
    boardVM,
    interactive = false,
    onCellHover,
    onCellLeave,
    onCellPress,
}: BoardProps) {

    const size = boardVM.size;

    return (
        <div
            className={cn(
                "w-[500px] h-[500px] max-w-full max-h-full",
            )}
        >
            <div
                className={cn(
                    "grid",
                    "gap-[3px]"
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
                        className="text-sm text-slate-400 text-center"
                    >
                        {String.fromCharCode(65 + i)}
                    </div>
                ))}

                {/* --- Rows and cells --- */}
            
                {boardVM.cells.map((rowData, row) => (
                    <React.Fragment key={row}>
                        {/* Row number */}
                        <div className="text-sm text-slate-400 text-center">
                            {row + 1}
                        </div>
                        
                        {/* Cells */}
                        {rowData.map((vmCell, col) => (
                            <Cell
                                key={`${row}-${col}`}
                                presentation={vmCell.presentation}
                                position={{ row, col }}
                                disabled={!interactive}
                                onHover={onCellHover}
                                onLeave={onCellLeave}
                                onPress={() =>
                                    onCellPress?.({
                                        position: {
                                            row,
                                            col,
                                        },
                                        shipType: vmCell.shipType,
                                    })
                                }
                            />
                        ))}
                    </React.Fragment>
                ))}
            </div>
        </div>  
    );
}