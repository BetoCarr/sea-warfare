import type { Position } from '@/lib/domain/shared/models/Position';
import type { Orientation } from '@/lib/domain/placement/models/Orientation';
import type { ShipType } from '@/lib/domain/ships/models/ShipType';

import type { PlacementPreview } from '../derive/placement-preview.types';
import type { PlacementAvailability } from '../derive/placement-availability.types';
import type { PlacementPresentation } from '../derive/placement-presentation.types';

export type PlacementFlow = {
    selectedShipType: ShipType | null;

    orientation: Orientation;

    preview: PlacementPreview | null;

    availability: PlacementAvailability;

    presentation: PlacementPresentation;

    selectShip: (
        shipType: ShipType | null,
    ) => void;

    setHoveredCell: (
        position: Position | null,
    ) => void;

    placeShip: () => void;

    rotate: () => void;

    confirmFleet: () => void;
};