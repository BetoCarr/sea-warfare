import { useMemo } from 'react';
import { getVisualState } from './getVisualState';
import { deriveShipOccupancy } from '../placement/derive/deriveShipOccupancy';
import { ShipPlacement } from '@/lib/domain/placement/models/ShipPlacement';
import type { BoardViewModel, BoardCellVM } from './board-types';
// import type { CellState } from '@/lib/utils/types';
import type { PlacementPreview } from '../placement/derive/placement-preview.types';
import type { ShipType } from '@/lib/domain/ships/models/ShipType';

export type BoardVariant =
    | 'player'
    | 'enemy';

interface UseBoardViewModelParams {
    boardVariant: BoardVariant;
    size: number;
    // cells: CellState[][];
    playerPlacements: ShipPlacement[];
    preview?: PlacementPreview | null;
    selectedShipType?: ShipType | null;
    showShips: boolean;
}


export function useBoardViewModel({
    boardVariant,
    size,
    // cells,
    playerPlacements,
    preview,
    selectedShipType,
    showShips,
}: UseBoardViewModelParams): BoardViewModel {

    const vm = useMemo(() => {

        const shipCells = deriveShipOccupancy(playerPlacements);

        const result: BoardCellVM[][] = [];

        for (let row = 0; row < size; row++) {
            const rowCells: BoardCellVM[] = [];

            for (let col = 0; col < size; col++) {
                
                const cellState = cells[row]?.[col] ?? 'empty';

                // find ship in this cell (O(n) but acceptable at 10x10 scale)
                const shipAtCell = shipCells.find(
                    c =>
                        c.position.row === row &&
                        c.position.col === col,
                );

                const shipType = shipAtCell?.shipType;

                const isPreview = preview?.cells?.some(
                    p => p.row === row && p.col === col,
                ) ?? false;
                
                const isActiveShip =
                    selectedShipType != null &&
                    shipType === selectedShipType &&
                    preview != null;

                const visualState = getVisualState({
                    boardVariant,
                    cellState: cellState,
                    shipType,
                    isPreview,
                    isActiveShip,
                    previewResult: preview?.isValid ? 'valid' : 'invalid', // revisar
                    showShips,
                });

                rowCells.push({
                    row,
                    col,
                    shipType: isActiveShip ? undefined : shipType,
                    visualState,
                });
            }

            result.push(rowCells);
        }

        return {
            size,
            cells: result,
        };

    }, [boardVariant, size, cells, playerPlacements, preview, selectedShipType, showShips]);

    return vm;
}