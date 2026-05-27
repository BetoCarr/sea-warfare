export type PlacementValidationError =
    | 'OUT_OF_BOUNDS'
    | 'OVERLAP';

export type PlacementValidationResult =
    | { valid: true }
    | {
        valid: false;
        error: PlacementValidationError;
    };  