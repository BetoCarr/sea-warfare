import { useMemo } from 'react';

import { createPlacementContract } from '../contract/createPlacementContract';

import type { PlacementContract } from '../contract/placement-contract.types';
import type { PlacementDerivations } from './placement-derivations.types';
import type { PlacementFeedback } from '../derive/placement-feedback.types';

export function usePlacementContract(
    derivations: PlacementDerivations,
    feedback: PlacementFeedback | null
): PlacementContract {
    return useMemo(
        () => createPlacementContract({
            capabilities: derivations.capabilities,
            instruction: derivations.instruction,
            feedback,
            stats: derivations.stats,
        }),
        [derivations.capabilities, derivations.instruction, feedback, derivations.stats],
    );
}
