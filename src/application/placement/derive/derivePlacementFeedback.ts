import type { PlacementOutcome } from '@/lib/domain/placement/models/PlacementOutcome';

import type { PlacementValidationError } from '@/lib/domain/placement/models/PlacementValidationError';

import type { PlacementPreview } from './placement-preview.types';

type DerivePlacementFeedbackParams = {
    preview: PlacementPreview | null;
    outcome: PlacementOutcome | null;
};
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

export function derivePlacementFeedback({
    preview,
    outcome,
}: DerivePlacementFeedbackParams): PlacementFeedback | null {

    if (preview && !preview.isValid) {
        return {
            type: 'invalid-placement',
            validationError: preview.validationError,
        };
    }

    if (outcome === 'placed') {
        return {
            type: 'ship-placed',
        };
    }

    if (outcome === 'repositioned') {
        return {
            type: 'ship-repositioned',
        };
    }

    return null;
}
