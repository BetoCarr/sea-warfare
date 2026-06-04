import type { PlacementValidationError } from '@/lib/domain/placement/models/PlacementValidationError';

export type PlacementPresentationMessage =
    | 'FLEET_READY'
    | 'SELECT_SHIP'
    | 'SELECT_POSITION'
    | 'INVALID_PLACEMENT'
    | 'PLACE_SHIP';

export type PlacementPresentation = {
    message: PlacementPresentationMessage;
    validationError?: PlacementValidationError;
};