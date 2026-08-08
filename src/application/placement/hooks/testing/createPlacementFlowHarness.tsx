import React, { act } from 'react';

import { createRoot } from 'react-dom/client';



import { PlacementFlow } from '../placement-flow.types';

import { usePlacementFlow } from '../usePlacement';

export type PlacementFlowHarness = {
    getCurrent: () => PlacementFlow;
    unmount: () => void;
};;

export function createPlacementFlowHarness(): PlacementFlowHarness {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const root = createRoot(container); // Create react tree

    const hookState: { // Mutable object to hold the current state of the hook
        current: PlacementFlow | null;
    } = {
        current: null,
    };

    function TestComponent(): null { // "Vehicule" for testing the hook
        hookState.current = usePlacementFlow(); // Execute the hook and store its return value in hookState
        return null;
    }

    act(() => {
        root.render(React.createElement(TestComponent));// Mount the TestComponent to execute the hook and populate hookState.current
    });

    return {
        getCurrent: () => hookState.current!,
        unmount: () => {
            act(() => {
                root.unmount();
            });
            container.remove();
        },
    };
}
