import { DEFAULT_BOARD_SIZE } from '@/lib/domain/board/models/BoardConfig';
import { Position } from '@/lib/domain/shared/models/Position';
import { Orientation } from '@/lib/domain/placement/models/Orientation';

import { canPlaceShip } from '@/lib/domain/placement/rules/canPlaceShip';
import { getShipCoordinates } from '@/lib/domain/placement/rules/getShipCoordinates';

import type { ShipPlacement } from '@/lib/domain/placement/models/ShipPlacement';
import type { BaseShip } from '@/lib/domain/ships/models/BaseShip';
import type { PlacementPreview } from './placement-preview.types';


type DerivePlacementPreviewParams = {
    selectedShip: BaseShip | null;

    hoveredCell: Position | null;

    orientation: Orientation;
    
    existingPlacements: ShipPlacement[];

    boardSize?: number;
};

export function derivePlacementPreview({
    selectedShip,
    hoveredCell,
    orientation,
    existingPlacements,
    boardSize = DEFAULT_BOARD_SIZE,
}: DerivePlacementPreviewParams): PlacementPreview | null {


    if (!selectedShip || !hoveredCell) {
        return null;
    }

    const cells = getShipCoordinates({
        origin: hoveredCell,
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
        origin: hoveredCell,
        orientation,
        existingPlacements: placementsForValidation,
    });

    return {
        cells,
        isValid: validation.valid,
        validationError: validation.valid
            ? undefined
            : validation.error,
    };
}