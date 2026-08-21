
import type { UpsertShipPlacementResult } from '@/lib/domain/placement/models/UpsertShipPlacementResult';

type DerivePlacementFeedbackParams = {
    mutationResult: UpsertShipPlacementResult | null;
};

export function derivePlacementFeedback({
    mutationResult
}: DerivePlacementFeedbackParams): string | null {

    if (!mutationResult) {
        return null;
    }

    if (!mutationResult.success) {
        return mutationResult.error === 'OUT_OF_BOUNDS'
            ? 'The ship does not fit on the board.'
            : 'The ship overlaps another ship.';
    }

    if (mutationResult.outcome === 'placed') {
        return 'Ship placed successfully.';
    }

    if (mutationResult.outcome === 'repositioned') {
        return 'Ship repositioned successfully.';
    }

    return null;
}
