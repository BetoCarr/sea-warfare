import React, { act } from 'react';
import { createRoot } from 'react-dom/client';

import { usePlacementFlow } from './usePlacementFlow';
import { useGameplayStore } from '@/lib/store/gameplay/gameplay-store';
import { initialGameplayState } from '@/lib/store/gameplay/gameplay-store.initial';
import { usePlacementInteractionStore } from '../interactions/placement-interaction.store';
import { initialPlacementInteractionState } from '../interactions/placement-interaction.initial';
import { STANDARD_FLEET } from '@/lib/domain/ships/models/StandardFleet';
import type { ShipPlacement } from '@/lib/domain/placement/models/ShipPlacement';

declare global {
    var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}

const carrier = STANDARD_FLEET.find(ship => ship.type === 'carrier')!;
const destroyer = STANDARD_FLEET.find(ship => ship.type === 'destroyer')!;

function createDestroyerPlacement(): ShipPlacement {
    return {
        ship: destroyer,
        origin: { row: 0, col: 0 },
        orientation: 'horizontal',
    };
}

function createHookHarness() {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const root = createRoot(container);
    const hookState: {
        current: ReturnType<typeof usePlacementFlow> | null;
    } = {
        current: null,
    };

    function TestComponent(): null {
        hookState.current = usePlacementFlow();
        return null;
    }

    act(() => {
        root.render(React.createElement(TestComponent));
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

function resetStores() {
    useGameplayStore.setState({
        ...initialGameplayState,
        playerPlacements: [],
    });

    usePlacementInteractionStore.setState({
        ...initialPlacementInteractionState,
        selectedShipType: null,
        hoveredCell: null,
        orientation: 'horizontal',
    });
}

describe('usePlacementFlow placeShip', () => {
    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        resetStores();
    });

    afterEach(() => {
        useGameplayStore.setState(initialGameplayState);
        usePlacementInteractionStore.setState(initialPlacementInteractionState);
    });

    it('creates a new placement when the selected ship can be placed', () => {
        usePlacementInteractionStore.setState({
            ...initialPlacementInteractionState,
            selectedShipType: 'carrier',
            hoveredCell: { row: 0, col: 0 },
            orientation: 'horizontal',
        });

        const harness = createHookHarness();

        act(() => {
            harness.getCurrent().placeShip();
        });

        expect(useGameplayStore.getState().playerPlacements).toEqual([
            {
                ship: carrier,
                origin: { row: 0, col: 0 },
                orientation: 'horizontal',
            },
        ]);
        expect(usePlacementInteractionStore.getState().selectedShipType).toBeNull();

        harness.unmount();
    });

    it('replaces an existing placement when the same ship is placed again', () => {
        useGameplayStore.setState({
            ...initialGameplayState,
            playerPlacements: [
                {
                    ship: carrier,
                    origin: { row: 0, col: 0 },
                    orientation: 'horizontal',
                },
            ],
        });

        usePlacementInteractionStore.setState({
            ...initialPlacementInteractionState,
            selectedShipType: 'carrier',
            hoveredCell: { row: 0, col: 5 },
            orientation: 'horizontal',
        });

        const harness = createHookHarness();

        act(() => {
            harness.getCurrent().placeShip();
        });

        expect(useGameplayStore.getState().playerPlacements).toHaveLength(1);
        expect(useGameplayStore.getState().playerPlacements[0]).toEqual({
            ship: carrier,
            origin: { row: 0, col: 5 },
            orientation: 'horizontal',
        });
        expect(usePlacementInteractionStore.getState().selectedShipType).toBeNull();

        harness.unmount();
    });

    it('does not mutate placements when placement validation fails', () => {
        const initialPlacements = [createDestroyerPlacement()];

        useGameplayStore.setState({
            ...initialGameplayState,
            playerPlacements: initialPlacements,
        });

        usePlacementInteractionStore.setState({
            ...initialPlacementInteractionState,
            selectedShipType: 'carrier',
            hoveredCell: { row: 0, col: 7 },
            orientation: 'horizontal',
        });

        const harness = createHookHarness();

        act(() => {
            harness.getCurrent().placeShip();
        });

        expect(useGameplayStore.getState().playerPlacements).toEqual(initialPlacements);
        expect(usePlacementInteractionStore.getState().selectedShipType).toBe('carrier');

        harness.unmount();
    });

    it('does nothing when no ship is selected', () => {
        const initialPlacements = [createDestroyerPlacement()];

        useGameplayStore.setState({
            ...initialGameplayState,
            playerPlacements: initialPlacements,
        });

        usePlacementInteractionStore.setState({
            ...initialPlacementInteractionState,
            selectedShipType: null,
            hoveredCell: { row: 0, col: 0 },
            orientation: 'horizontal',
        });

        const harness = createHookHarness();

        act(() => {
            harness.getCurrent().placeShip();
        });

        expect(useGameplayStore.getState().playerPlacements).toEqual(initialPlacements);

        harness.unmount();
    });

    it('does nothing when no hovered cell exists', () => {
        const initialPlacements = [createDestroyerPlacement()];

        useGameplayStore.setState({
            ...initialGameplayState,
            playerPlacements: initialPlacements,
        });

        usePlacementInteractionStore.setState({
            ...initialPlacementInteractionState,
            selectedShipType: 'carrier',
            hoveredCell: null,
            orientation: 'horizontal',
        });

        const harness = createHookHarness();

        act(() => {
            harness.getCurrent().placeShip();
        });

        expect(useGameplayStore.getState().playerPlacements).toEqual(initialPlacements);

        harness.unmount();
    });
});
