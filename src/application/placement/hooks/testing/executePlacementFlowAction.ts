import { act } from 'react';

import type { PlacementFlow } from '../placement-flow.types';
import { createPlacementFlowHarness } from './createPlacementFlowHarness';
import { usePlacementFlow } from '../usePlacementFlow';

export function executePlacementFlowAction(
    callback: (flow: PlacementFlow) => void,
): void {
    const harness = createPlacementFlowHarness();

    try {
        act(() => {
            callback(harness.getCurrent());
        });
    } finally {
        harness.unmount();
    }
}
