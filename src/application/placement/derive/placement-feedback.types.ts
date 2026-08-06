import type { PlacementValidationError } from '@/lib/domain/placement/models/PlacementValidationError';

export type PlacementFeedback =
    | {
        type: 'invalid-placement';
        validationError: PlacementValidationError;
    }
    | {
        type: 'ship-placed';
    }
    | {
        type: 'ship-repositioned';
    };