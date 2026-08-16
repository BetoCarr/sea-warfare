import React, { act } from 'react';
import { createRoot } from 'react-dom/client';

import { initialPlacementInteractionState } from '../../interactions/placement-interaction.initial';
import { usePlacementInteractionStore } from '../../interactions/placement-interaction.store';
import { usePlacementInteractions } from '../usePlacementInteractions';

import { resetPlacementStores } from '../testing/resetPlacementStores';

import type { PlacementInteractionResult } from '../../interactions/placement-interaction.types';

declare global {
    var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}

type HookHarness = {
    getCurrent: () => ReturnType<typeof usePlacementInteractions>;
    unmount: () => void;
};

function createHookHarness(): HookHarness {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const root = createRoot(container);
    const hookState: { current: ReturnType<typeof usePlacementInteractions> | null } = {
        current: null,
    };

    function TestComponent(): null {
        hookState.current = usePlacementInteractions();
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

describe('usePlacementInteractions', () => {
    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        resetPlacementStores();
    });

    it('returns a place-ship result when interacting with the active target cell while a ship is selected', () => {
        usePlacementInteractionStore.setState({
            ...initialPlacementInteractionState,
            selectedShipType: 'carrier',
            targetCell: { row: 2, col: 3 },
        });

        const harness = createHookHarness();
        let result: PlacementInteractionResult = null;

        act(() => {
            result = harness.getCurrent().onBoardInteraction({
                position: { row: 2, col: 3 },
            });
        });

        expect(result).toEqual({ type: 'place-ship' });
        expect(usePlacementInteractionStore.getState().selectedShipType).toBe('carrier');
        expect(usePlacementInteractionStore.getState().targetCell).toEqual({ row: 2, col: 3 });

        harness.unmount();
    });

    it('returns null and updates the target cell when moving to a different cell while a ship is selected', () => {
        usePlacementInteractionStore.setState({
            ...initialPlacementInteractionState,
            selectedShipType: 'carrier',
            targetCell: { row: 2, col: 3 },
        });

        const harness = createHookHarness();
        let result: PlacementInteractionResult = null;

        act(() => {
            result = harness.getCurrent().onBoardInteraction({
                position: { row: 4, col: 5 },
            });
        });

        expect(result).toBeNull();
        expect(usePlacementInteractionStore.getState().targetCell).toEqual({ row: 4, col: 5 });

        harness.unmount();
    });

    it('selects a ship and returns null when interacting with an occupied cell', () => {
        const harness = createHookHarness();
        let result: PlacementInteractionResult = null;

        act(() => {
            result = harness.getCurrent().onBoardInteraction({
                position: { row: 0, col: 0 },
                shipType: 'carrier',
            });
        });

        expect(result).toBeNull();
        expect(usePlacementInteractionStore.getState().selectedShipType).toBe('carrier');
        expect(usePlacementInteractionStore.getState().targetCell).toEqual({ row: 0, col: 0 });

        harness.unmount();
    });

    it('selects a ship and clears the target cell when selectShip is called', () => {
        usePlacementInteractionStore.setState({
            ...initialPlacementInteractionState,
            selectedShipType: 'destroyer',
            targetCell: { row: 2, col: 3 },
        });

        const harness = createHookHarness();

        act(() => {
            harness.getCurrent().selectShip('carrier');
        });

        expect(usePlacementInteractionStore.getState().selectedShipType).toBe('carrier');
        expect(usePlacementInteractionStore.getState().targetCell).toBeNull();

        harness.unmount();
    });

    it('clears the interaction when selectShip(null) is called', () => {
        usePlacementInteractionStore.setState({
            ...initialPlacementInteractionState,
            selectedShipType: 'carrier',
            targetCell: { row: 2, col: 3 },
        });

        const harness = createHookHarness();

        act(() => {
            harness.getCurrent().selectShip(null);
        });

        expect(usePlacementInteractionStore.getState().selectedShipType).toBeNull();
        expect(usePlacementInteractionStore.getState().targetCell).toBeNull();

        harness.unmount();
    });

    it('toggles orientation between horizontal and vertical with rotate()', () => {
        usePlacementInteractionStore.setState({
            ...initialPlacementInteractionState,
            orientation: 'horizontal',
        });

        const harness = createHookHarness();

        act(() => {
            harness.getCurrent().rotate();
        });
        expect(usePlacementInteractionStore.getState().orientation).toBe('vertical');

        act(() => {
            harness.getCurrent().rotate();
        });
        expect(usePlacementInteractionStore.getState().orientation).toBe('horizontal');

        harness.unmount();
    });

    it('clears the target cell when leaving the board without a selected ship', () => {
        usePlacementInteractionStore.setState({
            ...initialPlacementInteractionState,
            selectedShipType: null,
            targetCell: { row: 2, col: 3 },
        });

        const harness = createHookHarness();

        act(() => {
            harness.getCurrent().onBoardLeave();
        });

        expect(usePlacementInteractionStore.getState().targetCell).toBeNull();

        harness.unmount();
    });

    it('preserves the target cell when leaving the board while a ship is selected', () => {
        const targetCell = { row: 2, col: 3 };

        usePlacementInteractionStore.setState({
            ...initialPlacementInteractionState,
            selectedShipType: 'carrier',
            targetCell,
        });

        const harness = createHookHarness();

        act(() => {
            harness.getCurrent().onBoardLeave();
        });

        expect(usePlacementInteractionStore.getState().targetCell).toEqual(targetCell);

        harness.unmount();
    });
});
