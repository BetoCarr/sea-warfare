
import type { PlacementInstruction } from './placement-instruction.types';

import type { Position } from '@/lib/domain/shared/models/Position';

import type { ShipType } from '@/lib/domain/ships/models/ShipType';

type DerivePlacementInstructionParams = {
    selectedShipType: ShipType | null;
    targetCell: Position | null;
};

export function derivePlacementInstruction({
    selectedShipType,
    targetCell,
}: DerivePlacementInstructionParams): PlacementInstruction {

    if (!selectedShipType) {
        return 'Select ship';
    }

    if (!targetCell) {
        return 'Select position';
    }

    return 'Place ship';
}