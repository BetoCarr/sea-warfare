import React, { act } from 'react';
import { createRoot } from 'react-dom/client';

import { usePlacement } from '../usePlacement';
import { resetPlacementStores } from '../testing/resetPlacementStores';

import { useGameplayStore } from '@/lib/store/gameplay-store';

import type { ShipPlacement } from '@/lib/domain/placement/models/ShipPlacement';

declare global {
    var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}

type HookHarness = {
    getCurrent: () => ReturnType<typeof usePlacement>;
    unmount: () => void;
};

function createHookHarness(): HookHarness {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const root = createRoot(container);
    const hookState: { current: ReturnType<typeof usePlacement> | null } = {
        current: null,
    };

    function TestComponent(): null {
        hookState.current = usePlacement();
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

function triggerPlacementAt(harness: HookHarness, shipType: 'carrier' | 'destroyer' | 'cruiser' | 'battleship' | 'submarine', origin: { row: number; col: number }): void {
    act(() => {
        harness.getCurrent().interaction.selectShip(shipType);
    });

    act(() => {
        harness.getCurrent().interaction.onBoardInteraction({ position: origin });
    });

    act(() => {
        harness.getCurrent().interaction.onBoardInteraction({ position: origin });
    });
}

describe('usePlacement', () => {
    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        jest.useFakeTimers();

        act(() => {
            resetPlacementStores();
        });
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    it('does not place a ship when the interaction does not resolve to place-ship', () => {
        const harness = createHookHarness();

        act(() => {
            harness.getCurrent().interaction.onBoardInteraction({
                position: { row: 2, col: 3 },
            });
        });

        expect(useGameplayStore.getState().playerPlacements).toEqual([]);
        expect(harness.getCurrent().contract.feedback).toBeNull();
        expect(harness.getCurrent().interaction.selectedShipType).toBeNull();

        harness.unmount();
    });

    it('places a new ship and clears the selection after a successful mutation', () => {
        const harness = createHookHarness();

        triggerPlacementAt(harness, 'carrier', { row: 0, col: 0 });

        expect(useGameplayStore.getState().playerPlacements).toEqual([
            {
                ship: { type: 'carrier', size: 5 },
                origin: { row: 0, col: 0 },
                orientation: 'horizontal',
            },
        ]);
        expect(harness.getCurrent().contract.feedback).toBe('Ship placed successfully.');
        expect(harness.getCurrent().interaction.selectedShipType).toBeNull();
        expect(harness.getCurrent().interaction.targetCell).toBeNull();

        harness.unmount();
    });

    it('repositions an existing ship and clears the selection after a successful mutation', () => {
        const existingCarrier: ShipPlacement = {
            ship: { type: 'carrier', size: 5 },
            origin: { row: 0, col: 0 },
            orientation: 'horizontal',
        };

        act(() => {
            useGameplayStore.setState({
                playerPlacements: [existingCarrier],
            });
        });

        const harness = createHookHarness();

        triggerPlacementAt(harness, 'carrier', { row: 5, col: 2 });

        expect(useGameplayStore.getState().playerPlacements).toHaveLength(1);
        expect(useGameplayStore.getState().playerPlacements).toEqual([
            {
                ship: { type: 'carrier', size: 5 },
                origin: { row: 5, col: 2 },
                orientation: 'horizontal',
            },
        ]);
        expect(harness.getCurrent().contract.feedback).toBe('Ship repositioned successfully.');
        expect(harness.getCurrent().interaction.selectedShipType).toBeNull();

        harness.unmount();
    });

    it('returns invalid placement feedback without clearing the selected ship when the placement overlaps', () => {
        const existingDestroyer: ShipPlacement = {
            ship: { type: 'destroyer', size: 2 },
            origin: { row: 0, col: 0 },
            orientation: 'horizontal',
        };

        act(() => {
            useGameplayStore.setState({
                playerPlacements: [existingDestroyer],
            });
        });

        const harness = createHookHarness();

        triggerPlacementAt(harness, 'carrier', { row: 0, col: 0 });

        expect(useGameplayStore.getState().playerPlacements).toEqual([existingDestroyer]);
        expect(harness.getCurrent().contract.feedback).toBe('The ship overlaps another ship.');
        expect(harness.getCurrent().interaction.selectedShipType).toBe('carrier');

        harness.unmount();
    });

    it('returns invalid placement feedback without mutating state when the placement is out of bounds', () => {
        const existingCarrier: ShipPlacement = {
            ship: { type: 'carrier', size: 5 },
            origin: { row: 6, col: 0 },
            orientation: 'horizontal',
        };

        act(() => {
            useGameplayStore.setState({
                playerPlacements: [existingCarrier],
            });
        });

        const harness = createHookHarness();

        triggerPlacementAt(harness, 'carrier', { row: 0, col: 6 });

        expect(useGameplayStore.getState().playerPlacements).toEqual([existingCarrier]);
        expect(harness.getCurrent().contract.feedback).toBe('The ship does not fit on the board.');
        expect(harness.getCurrent().interaction.selectedShipType).toBe('carrier');

        harness.unmount();
    });

    it('expires feedback after the configured duration', () => {
        const harness = createHookHarness();

        triggerPlacementAt(harness, 'carrier', { row: 0, col: 0 });

        expect(harness.getCurrent().contract.feedback).toBe('Ship placed successfully.');

        act(() => {
            jest.advanceTimersByTime(4000);
        });

        expect(harness.getCurrent().contract.feedback).toBeNull();

        harness.unmount();
    });

    it('replaces the previous feedback when a second mutation happens before the first timer expires', () => {
        const harness = createHookHarness();

        triggerPlacementAt(harness, 'carrier', { row: 0, col: 0 });
        expect(harness.getCurrent().contract.feedback).toBe('Ship placed successfully.');

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        triggerPlacementAt(harness, 'carrier', { row: 5, col: 2 });

        expect(harness.getCurrent().contract.feedback).toBe('Ship repositioned successfully.');

        harness.unmount();
    });

    it('resets the feedback timer when a second mutation occurs before the first timer finishes', () => {
        const harness = createHookHarness();

        triggerPlacementAt(harness, 'carrier', { row: 0, col: 0 });

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        triggerPlacementAt(harness, 'carrier', { row: 5, col: 2 });

        act(() => {
            jest.advanceTimersByTime(3000);
        });

        expect(harness.getCurrent().contract.feedback).toBe('Ship repositioned successfully.');

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        expect(harness.getCurrent().contract.feedback).toBeNull();

        harness.unmount();
    });

    it('cleans up the feedback timer when the hook unmounts', () => {
        const harness = createHookHarness();

        triggerPlacementAt(harness, 'carrier', { row: 0, col: 0 });

        expect(jest.getTimerCount()).toBe(1);

        harness.unmount();

        expect(jest.getTimerCount()).toBe(0);
    });
});
