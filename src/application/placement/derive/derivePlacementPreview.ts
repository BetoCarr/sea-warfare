import { DEFAULT_BOARD_SIZE } from '@/lib/domain/board/models/BoardConfig';

import { canPlaceShip } from '@/lib/domain/placement/rules/canPlaceShip';
import { getShipCoordinates } from '@/lib/domain/placement/rules/getShipCoordinates';

import type { ShipPlacement } from '@/lib/domain/placement/models/ShipPlacement';
import type { BaseShip } from '@/lib/domain/ships/models/BaseShip';

import type { PlacementInteractionState } from '../interactions/placement-interaction.types';
import type { PlacementPreview } from './placement-preview.types';

type DerivePlacementPreviewParams = {
    selectedShip: BaseShip | null;

    interaction: PlacementInteractionState;

    existingPlacements: ShipPlacement[];

    boardSize?: number;
};

export function derivePlacementPreview({
    selectedShip,
    interaction,
    existingPlacements,
    boardSize = DEFAULT_BOARD_SIZE,
}: DerivePlacementPreviewParams): PlacementPreview | null {

    const { hoveredCell, orientation } = interaction;

    if (!selectedShip || !hoveredCell) {
        return null;
    }

    const cells = getShipCoordinates({
        origin: hoveredCell,
        size: selectedShip.size,
        orientation,
    });

    const validation = canPlaceShip({
        boardSize,
        ship: selectedShip,
        origin: hoveredCell,
        orientation,
        existingPlacements,
    });

    return {
        cells,
        isValid: validation.valid,
        validationError: validation.valid
            ? undefined
            : validation.error,
    };
}