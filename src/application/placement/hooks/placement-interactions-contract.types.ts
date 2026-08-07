import { BoardCellInteraction } from '../interactions/placement-interaction.types';

import type { Orientation } from '@/lib/domain/placement/models/Orientation';


import type { Position } from '@/lib/domain/shared/models/Position';


import { BaseShip } from '@/lib/domain/ships/models/BaseShip';

import type { ShipType } from '@/lib/domain/ships/models/ShipType';


export type PlacementInteractionsContract = {

    // interaction state
    selectedShipType: ShipType | null;
    selectedShip: BaseShip | null;
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