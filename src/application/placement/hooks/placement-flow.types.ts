import { BoardCellInteraction } from '../interactions/placement-interaction.types';

import { ShipPlacement } from '@/lib/domain/placement/models/ShipPlacement';



// import type { PlacementAvailability } from '../derive/placement-stats.types';

// import type { PlacementPresentation } from '../derive/placement-instruction.types';

import type { PlacementPreview } from '../derive/placement-preview.types';

import type { Orientation } from '@/lib/domain/placement/models/Orientation';


import type { Position } from '@/lib/domain/shared/models/Position';

import type { ShipType } from '@/lib/domain/ships/models/ShipType';

export type PlacementFlow = {
    // authoritative state
    playerPlacements: ShipPlacement[];

    // interaction state
    selectedShipType: ShipType | null;
    orientation: Orientation;
    targetCell: Position | null;
    
    // derived state
    preview: PlacementPreview | null;
    // availability: PlacementAvailability;
    // presentation: PlacementPresentation;

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

    // domain mutations
    placeShip: () => void;
    confirmFleet: () => void;
};