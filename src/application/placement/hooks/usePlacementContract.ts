import { useMemo } from 'react';

import { createPlacementContract } from '../contract/createPlacementContract';

import type { PlacementContract } from '../contract/placement-contract.types';
import type { PlacementDerivations } from './placement-derivations.types';

export function usePlacementContract(
    derivations: PlacementDerivations,
): PlacementContract {
    return useMemo(
        () => createPlacementContract({
            capabilities: derivations.capabilities,
            instruction: derivations.instruction,
            feedback: derivations.feedback,
            stats: derivations.stats,
        }),
        [derivations.capabilities, derivations.instruction, derivations.feedback, derivations.stats],
    );
}
