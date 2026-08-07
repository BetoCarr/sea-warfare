import { BoardCellInteraction } from '../interactions/placement-interaction.types';

import type { Orientation } from '@/lib/domain/placement/models/Orientation';


import type { Position } from '@/lib/domain/shared/models/Position';

import type { ShipType } from '@/lib/domain/ships/models/ShipType';


export type PlacementInteractions = {

    // interaction state
    selectedShipType: ShipType | null;
    orientation: Orientation;
    targetCell: Position | null;

    // interaction actions
    selectShip: (
        shipType: ShipType | null,
    ) => void;

    setTargetCell: (
        position: Position | null,
    ) => void;

    rotate: () => void;

    onBoardInteraction(
        interaction: BoardCellInteraction,
    ): void;

    onBoardLeave(): void;
}