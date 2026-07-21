import { BoardCellInteraction } from '../interactions/placement-interaction.types';

import { ShipPlacement } from '@/lib/domain/placement/models/ShipPlacement';



import type { PlacementAvailability } from '../derive/placement-availability.types';

import type { PlacementPresentation } from '../derive/placement-presentation.types';

import type { PlacementPreview } from '../derive/placement-preview.types';

import type { Orientation } from '@/lib/domain/placement/models/Orientation';

import type { PlacementState } from '@/lib/domain/placement/models/PlacementState';

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
    availability: PlacementAvailability;
    presentation: PlacementPresentation;
    placementState: PlacementState;
    canPlaceShip: boolean;
    canConfirmFleet: boolean;
    canInteractWithBoard: boolean;

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