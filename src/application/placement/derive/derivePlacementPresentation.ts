import type { ShipType } from '@/lib/domain/ships/models/ShipType';

import type { PlacementPreview } from './placement-preview.types';
import type { PlacementAvailability } from './placement-availability.types';
import type { PlacementPresentation } from './placement-presentation.types';

type DerivePlacementPresentationParams = {
    selectedShipType: ShipType | null;

    preview: PlacementPreview | null;

    availability: PlacementAvailability;
};

export function derivePlacementPresentation({
    selectedShipType,
    preview,
    availability,
}: DerivePlacementPresentationParams): PlacementPresentation {

    if (availability.allShipsPlaced) {
        return {
            message: 'FLEET_READY',
        };
    }

    if (!selectedShipType) {
        return {
            message: 'SELECT_SHIP',
        };
    }

    if (!preview) {
        return {
            message: 'SELECT_POSITION',
        };
    }

    if (preview && !preview.isValid) {
        return {
            message: 'INVALID_PLACEMENT',

            validationError: preview.validationError,
        };
    }

    return {
        message: 'PLACE_SHIP',
    };
}