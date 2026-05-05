import type { ShipPlacementInfo } from '@/lib/utils/types';
import type { PlacementIntent } from './placement-types';

/**
 * Adapter functions to convert between PlacementIntent and ShipPlacementInfo
 * 
 * PlacementIntent is used for domain logic computations
 * ShipPlacementInfo is used for persisted state representation
 */

/**
 * Converts ShipPlacementInfo to PlacementIntent for domain logic
 */
export function toPlacementIntent(ship: ShipPlacementInfo): PlacementIntent {
    return {
        ship: {
            type: ship.type,
            size: ship.size
        },
        position: ship.position,
        orientation: ship.orientation
    };
}

/**
 * Converts PlacementIntent to ShipPlacementInfo for storage/state
 */
export function toShipPlacement(intent: PlacementIntent): ShipPlacementInfo {
    return {
        type: intent.ship.type,
        size: intent.ship.size,
        position: intent.position,
        orientation: intent.orientation
    };
}