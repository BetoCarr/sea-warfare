import type { PlacementOutcome } from '@/lib/domain/placement/models/PlacementOutcome';

import type { PlacementFeedback } from './placement-feedback.types';

import type { PlacementPreview } from './placement-preview.types';

type DerivePlacementFeedbackParams = {
    preview: PlacementPreview | null;
    outcome: PlacementOutcome | null;
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
