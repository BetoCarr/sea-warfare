import type { UpsertShipPlacementResult } from '@/lib/domain/placement/models/UpsertShipPlacementResult';
import type { PlacementFeedback } from './placement-feedback.types';


type DerivePlacementFeedbackParams = {
    mutationResult: UpsertShipPlacementResult | null;
};


export function derivePlacementFeedback({
    mutationResult
}: DerivePlacementFeedbackParams): PlacementFeedback | null {

    if (!mutationResult) {
        return null;
    }

    if (!mutationResult.success) {
        return {
            type: 'invalid-placement',
            validationError: mutationResult.error,
        };
    }

    if (mutationResult.outcome === 'placed') {
        return {
            type: 'ship-placed',
        };
    }

    if (mutationResult.outcome === 'repositioned') {
        return {
            type: 'ship-repositioned',
        };
    }

    return null;
}
