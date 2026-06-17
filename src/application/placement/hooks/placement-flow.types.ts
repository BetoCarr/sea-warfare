import type { Position } from '@/lib/domain/shared/models/Position';
import type { Orientation } from '@/lib/domain/placement/models/Orientation';
import type { ShipType } from '@/lib/domain/ships/models/ShipType';
import type { PlacementPreview } from '../derive/placement-preview.types';
import type { PlacementAvailability } from '../derive/placement-availability.types';
import type { PlacementPresentation } from '../derive/placement-presentation.types';
import { ShipPlacement } from '@/lib/domain/placement/models/ShipPlacement';

export type PlacementFlow = {
    // authoritative
    playerPlacements: ShipPlacement[];

    // interaction
    selectedShipType: ShipType | null;
    orientation: Orientation;
    targetCell: Position | null; // Agregar a la documentación
    
    // derived
    preview: PlacementPreview | null;
    availability: PlacementAvailability;
    presentation: PlacementPresentation;
    
    // interaction api
    selectShip: (
        shipType: ShipType | null,
    ) => void;

    setTargetCell: (
        position: Position | null,
    ) => void;

    rotate: () => void;

    onCellPress( // Agregar a la documentación
        position: Position,
    ): void;
    
    // mutations
    placeShip: () => void;
    confirmFleet: () => void;
};