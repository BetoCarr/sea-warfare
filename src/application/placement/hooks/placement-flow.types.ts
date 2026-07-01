import type { Position } from '@/lib/domain/shared/models/Position';
import type { Orientation } from '@/lib/domain/placement/models/Orientation';
import type { ShipType } from '@/lib/domain/ships/models/ShipType';
import type { PlacementPreview } from '../derive/placement-preview.types';
import type { PlacementAvailability } from '../derive/placement-availability.types';
import type { PlacementPresentation } from '../derive/placement-presentation.types';
import type { PlacementState } from '@/lib/domain/placement/models/PlacementState';
import { ShipPlacement } from '@/lib/domain/placement/models/ShipPlacement';
import { BoardCellInteraction } from '../interactions/placement-interaction.types';

export type PlacementFlow = {
    // authoritative
    playerPlacements: ShipPlacement[];

    // interaction
    selectedShipType: ShipType | null;
    orientation: Orientation;
    targetCell: Position | null;
    
    // derived
    preview: PlacementPreview | null;
    availability: PlacementAvailability;
    presentation: PlacementPresentation;
    placementState: PlacementState;  // Agregar a la documentación
    canPlaceShip: boolean;
    canConfirmFleet: boolean;
    canInteractWithBoard: boolean;

    // interaction api
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

    // mutations
    placeShip: () => void;
    confirmFleet: () => void;
};