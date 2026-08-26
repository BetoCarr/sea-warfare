import { useMemo } from 'react';

import { deriveCellPresentation } from './derive/deriveCellPresentation';
import { deriveCellVisualState } from './derive/deriveCellVisualState';
import { deriveLogicalCellInfo } from './derive/deriveLogicalCellInfo';

import type { PlacementPreview } from '../placement/derive/placement-preview.types';
import type { BoardViewModel, BoardCellVM } from './board-types';
import type { ShipType } from '@/lib/domain/ships/models/ShipType';
import type { ShipPlacement } from '@/lib/domain/placement/models/ShipPlacement';

export type BoardVariant =
    | 'player'
    | 'enemy';

export interface UseBoardViewModelParams {
    boardVariant: BoardVariant;
    size: number;
    playerPlacements?: ShipPlacement[];
    preview?: PlacementPreview | null;
    selectedShipType?: ShipType | null;
    showShips: boolean;
}

export function useBoardViewModel({
    boardVariant,
    size,
    playerPlacements,
    preview,
    selectedShipType,
    showShips,
}: UseBoardViewModelParams): BoardViewModel {

    return useMemo(() => {

        const result: BoardCellVM[][] = [];

        for (let row = 0; row < size; row++) {
            const rowCells: BoardCellVM[] = [];

            for (let col = 0; col < size; col++) {
                const position = { row, col };

                const logicalCell = deriveLogicalCellInfo(
                    position,
                    playerPlacements ?? [],
                );

                const isPreview = preview?.cells?.some(
                    p => p.row === row && p.col === col,
                ) ?? false;
                
                const previewResult =
                    preview == null
                        ? undefined
                        : preview.isValid
                            ? 'valid'
                            : 'invalid';
                            
                const isActiveShip =
                    selectedShipType != null &&
                    logicalCell.shipType === selectedShipType &&
                    preview != null;

                const visualState = deriveCellVisualState({
                    boardVariant,
                    logicalCell,
                    isPreview,
                    previewResult,
                    isActiveShip,
                    showShips,
                });

                const presentation =
                    deriveCellPresentation(
                        position,
                        visualState,
                        logicalCell.shipType,
                    );

                rowCells.push({
                    row,
                    col,
                    shipType: isActiveShip ? undefined : logicalCell.shipType,
                    presentation,
                });
            }

            result.push(rowCells);
        }

        return {
            size,
            cells: result,
        };

    }, [boardVariant, size, playerPlacements, preview, selectedShipType, showShips]);
}