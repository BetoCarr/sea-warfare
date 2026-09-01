import type { PlacementInstruction } from './placement-instruction.types';
import type { Position } from '@/lib/domain/shared/models/Position';
import type { ShipType } from '@/lib/domain/ships/models/ShipType';
import type { PlacementStats } from './placement-stats.types';

type DerivePlacementInstructionParams = {
    selectedShipType: ShipType | null;
    targetCell: Position | null;
    stats: PlacementStats,
    
};

export function derivePlacementInstruction({
    selectedShipType,
    targetCell,
    stats,
}: DerivePlacementInstructionParams): PlacementInstruction {

    if(stats.remainingShips === 0 ) {
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