import { useMemo } from 'react';
import type { BoardViewModel, BoardCellVM } from './board-types';
import type { CellState, Position } from '@/lib/utils/types';
import type { PlacementPreview } from '@/lib/game-logic/placement/placement-types';
import type { Ship } from '@/lib/utils/types';

interface UseBoardViewModelParams {
    size: number;
    cells: CellState[][];
    ships: Ship[];
    hoveredCell?: Position | null;
    preview?: PlacementPreview | null;
    draggingShipId?: string | null; // TODO: unify dragging identifier (shipId vs shipType) across placement and gameplay
    showShips: boolean;
}

export function useBoardViewModel({
    size,
    cells,
    ships,
    hoveredCell,
    preview,
    draggingShipId,
    showShips,
}: UseBoardViewModelParams): BoardViewModel {

    const vm = useMemo(() => {
        const getCellInfo = (row: number, col: number) => {

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
                isShipStart:
                shipInCell?.position?.row === row &&
                shipInCell?.position?.col === col,
            };
        };

        const result: BoardCellVM[][] = [];

        for (let row = 0; row < size; row++) {
            const rowCells: BoardCellVM[] = [];

            for (let col = 0; col < size; col++) {
                
                const currentState = cells[row]?.[col] || 'empty';

                let computedState: CellState = currentState;
                
                const cellInfo = getCellInfo(row, col);

                if (currentState === 'hit' || currentState === 'miss' || currentState === 'sunk') {
                    computedState = currentState;
                } else if (cellInfo.hasShip && showShips) {
                    computedState = 'ship';
                } else {
                    computedState = 'empty';
                }


                const isHovered =
                    hoveredCell?.row === row && hoveredCell?.col === col;

                const isPreview =
                    preview?.occupiedCells?.some(p => p.row === row && p.col === col) ?? false;

                const isGhost =
                    draggingShipId &&
                    cellInfo.ship?.id === draggingShipId;

                rowCells.push({
                    row,
                    col,
                    state: computedState,
                    isHovered,
                    isGhost: !!isGhost,                    
                    isPreview,
                });
            }

            result.push(rowCells);
        }

        return {
            size,
            cells: result,
        };

    }, [size, cells, ships, hoveredCell, preview, draggingShipId, showShips]);

    return vm;
}