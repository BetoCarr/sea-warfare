import type { PlacementAvailability } from './placement-availability.types';

import type { PlacementInstruction } from './placement-presentation.types';

import type { PlacementPreview } from './placement-preview.types';

import type { ShipType } from '@/lib/domain/ships/models/ShipType';

type DerivePlacementInstructionParams = {
    selectedShipType: ShipType | null;
    preview: PlacementPreview | null;
};

export function derivePlacementInstruction({
    selectedShipType,
    preview,
}: DerivePlacementInstructionParams): PlacementInstruction {
    if (!selectedShipType) {
        return 'Select ship';
    }

    if (!preview) {
        return 'Select position';
    }

    return 'Place ship';
}