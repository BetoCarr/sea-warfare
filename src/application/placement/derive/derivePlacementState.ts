import { PlacementState } from '@/lib/domain/placement/models/PlacementState';
import type { ShipPlacement } from '../../../lib/domain/placement/models/ShipPlacement';

type Params = {
    placements: ShipPlacement[];
    requiredFleetSize: number;
};

export function derivePlacementState({
    placements,
    requiredFleetSize,
}: Params): PlacementState {
    const isFleetReady = placements.length >= requiredFleetSize;

    return isFleetReady
        ? PlacementState.FLEET_READY
        : PlacementState.PLACING_SHIPS;
}