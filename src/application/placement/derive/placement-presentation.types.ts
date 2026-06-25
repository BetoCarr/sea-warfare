import type { PlacementValidationError } from '@/lib/domain/placement/models/PlacementValidationError';

export type PlacementPresentationMessage =
    | 'Fleet ready'
    | 'Select ship'
    | 'Select position'
    | 'Invalid placement'
    | 'Place ship';

export type PlacementPresentation = {
    message: PlacementPresentationMessage;
    validationError?: PlacementValidationError;
};