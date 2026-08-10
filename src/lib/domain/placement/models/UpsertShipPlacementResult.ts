
import type { PlacementOutcome } from '../models/PlacementOutcome';

import type { PlacementValidationError } from '../models/PlacementValidationError';

import type { ShipPlacement } from '../models/ShipPlacement';


export type UpsertShipPlacementResult =
    | {
        success: true;
        placements: ShipPlacement[];
        outcome: PlacementOutcome;
    }
    | {
        success: false;
        error: PlacementValidationError;
    };