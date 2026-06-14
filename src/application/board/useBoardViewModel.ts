import { useMemo } from 'react';
import { getCellInfo } from '@/lib/domain/ships/ship-cell-info';
import { getVisualState } from './getVisualState';
import type { BoardViewModel, BoardCellVM, CellVisualState } from './board-types';
import type { CellState } from '@/lib/utils/types';
import type { Position } from '@/lib/domain/shared/models/Position';
import type { Ship } from '@/lib/utils/types';
import type { PlacementPreview } from '../placement/derive/placement-preview.types';

export type BoardVariant =
    | 'player'
    | 'enemy';

interface UseBoardViewModelParams {
    boardVariant: BoardVariant;
    size: number;
    cells: CellState[][];
    ships: Ship[];
    preview?: PlacementPreview | null;
    showShips: boolean;
}

/**
 * useBoardViewModel
 * ------------------------------------------------------------
 * Transforms raw domain/game state into a UI-friendly structure.
 *
 * Responsibilities:
 * - Resolve ship presence per cell
 * - Derive interaction states (hover, preview, dragging)
 * - Convert domain state into a single visual state (visualState)
 *
 * Output:
 * - Fully declarative BoardViewModel consumed by the Board UI
 */
export function useBoardViewModel({
    boardVariant,
    size,
    cells,
    ships,
    preview,
    showShips,
}: UseBoardViewModelParams): BoardViewModel {

    const vm = useMemo(() => {

        const result: BoardCellVM[][] = [];

        const previewSet = new Set(
            preview?.cells?.map(p => `${p.row}-${p.col}`) ?? []
        );

        for (let row = 0; row < size; row++) {
            const rowCells: BoardCellVM[] = [];

            for (let col = 0; col < size; col++) {

                const currentState = cells[row]?.[col] || 'empty';
                
                const cellInfo = getCellInfo(row, col, ships);

                const isPreview = previewSet.has(`${row}-${col}`);

                let visualState = getVisualState({
                    boardVariant,
                    currentState,
                    hasShip: cellInfo.hasShip,
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

    }, [size, cells, ships, preview, showShips]);

    return vm;
}