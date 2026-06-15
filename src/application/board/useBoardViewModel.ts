import { useMemo } from 'react';
import { getVisualState } from './getVisualState';
import { deriveOccupiedCells } from '../placement/derive/deriveOccupiedCells';
import { ShipPlacement } from '@/lib/domain/placement/models/ShipPlacement';
import type { BoardViewModel, BoardCellVM } from './board-types';
import type { CellState } from '@/lib/utils/types';
import type { PlacementPreview } from '../placement/derive/placement-preview.types';

export type BoardVariant =
    | 'player'
    | 'enemy';

interface UseBoardViewModelParams {
    boardVariant: BoardVariant;
    size: number;
    cells: CellState[][];
    playerPlacements: ShipPlacement[];
    preview?: PlacementPreview | null;
    showShips: boolean;
}


export function useBoardViewModel({
    boardVariant,
    size,
    cells,
    playerPlacements,
    preview,
    showShips,
}: UseBoardViewModelParams): BoardViewModel {

    const vm = useMemo(() => {

        const result: BoardCellVM[][] = [];

        const previewSet = new Set(
            preview?.cells?.map(p => `${p.row}-${p.col}`) ?? []
        );

        const occupiedCellSet = new Set(
            deriveOccupiedCells(playerPlacements)
                .map(cell => `${cell.row}-${cell.col}`)
        );  

        for (let row = 0; row < size; row++) {
            const rowCells: BoardCellVM[] = [];

            for (let col = 0; col < size; col++) {

                const currentState = cells[row]?.[col] || 'empty';
                
                const cellKey = `${row}-${col}`;

                const hasShip =
                    occupiedCellSet.has(cellKey);

                const isPreview =
                    previewSet.has(cellKey);

                let visualState = getVisualState({
                    boardVariant,
                    currentState,
                    hasShip,
                    isPreview,
                    previewResult: preview?.isValid ? 'valid' : 'invalid',
                    showShips,
                });

                rowCells.push({
                    row,
                    col,
                    visualState,
                });
            }

            result.push(rowCells);
        }

        return {
            size,
            cells: result,
        };

    }, [size, cells, playerPlacements, preview, showShips]);

    return vm;
}