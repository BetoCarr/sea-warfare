import { DEFAULT_BOARD_SIZE } from '@/lib/domain/board/models/BoardConfig';

import { Orientation } from '@/lib/domain/placement/models/Orientation';

import { canPlaceShip } from '@/lib/domain/placement/rules/canPlaceShip';

import { getShipCoordinates } from '@/lib/domain/placement/rules/getShipCoordinates';

import { Position } from '@/lib/domain/shared/models/Position';



import type { PlacementPreview } from './placement-preview.types';

import type { ShipPlacement } from '@/lib/domain/placement/models/ShipPlacement';

import type { BaseShip } from '@/lib/domain/ships/models/BaseShip';

type DerivePlacementPreviewParams = {
    selectedShip: BaseShip | null;
    targetCell: Position | null;
    orientation: Orientation;
    existingPlacements: ShipPlacement[];
    boardSize?: number;
};

export function derivePlacementPreview({
    selectedShip,
    targetCell,
    orientation,
    existingPlacements,
    boardSize = DEFAULT_BOARD_SIZE,
}: DerivePlacementPreviewParams): PlacementPreview | null {


    if (!selectedShip || !targetCell) {
        return null;
    }

    const cells = getShipCoordinates({
        origin: targetCell,
        size: selectedShip.size,
        orientation,
    });

    const placementsForValidation =
        existingPlacements.filter(
            placement =>
                placement.ship.type !== selectedShip.type,
        );
    
    const validation = canPlaceShip({
        boardSize,
        ship: selectedShip,
        origin: targetCell,
        orientation,
        existingPlacements: placementsForValidation,
    });

    if (!validation.valid) {
        return {
            cells,
            isValid: false,
            validationError: validation.error,
        };
    }

    return {
        cells,
        isValid: true,
    };
}