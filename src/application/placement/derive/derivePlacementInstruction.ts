import type { PlacementInstruction } from './placement-instruction.types';
import type { Position } from '@/lib/domain/shared/models/Position';
import type { ShipType } from '@/lib/domain/ships/models/ShipType';

type DerivePlacementInstructionParams = {
    selectedShipType: ShipType | null;
    targetCell: Position | null;
    canConfirmFleet: boolean;    
};

export function derivePlacementInstruction({
    selectedShipType,
    targetCell,
    canConfirmFleet,
}: DerivePlacementInstructionParams): PlacementInstruction {

    if(canConfirmFleet) {
        return 'Confirm fleet';
    }

    if (!selectedShipType) {
        return 'Select ship';
    }

    if (!targetCell) {
        return 'Select position';
    }

    return 'Place ship';
}