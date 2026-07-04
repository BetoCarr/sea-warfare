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
            message: 'Fleet ready',
        };
    }

    if (!selectedShipType) {
        return {
            message: 'Select ship',
        };
    }

    if (!preview) {
        return {
            message: 'Select position',
        };
    }

    if (preview && !preview.isValid) {
        return {
            message: 'Invalid placement',
            validationError: preview.validationError,
        };
    }

    return {
        message: 'Place ship',
    };
}