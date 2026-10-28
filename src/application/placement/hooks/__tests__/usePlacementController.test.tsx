import React, { act } from 'react';
import { createRoot } from 'react-dom/client';

import { usePlacementController } from '../usePlacementController';
import { resetPlacementStores } from '../testing/resetPlacementStores';

import { useGameplayStore } from '@/lib/store/gameplay-store';

import type { ShipPlacement } from '@/lib/domain/placement/models/ShipPlacement';

declare global {
    var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}

type HookHarness = {
    getCurrent: () => ReturnType<typeof usePlacementController>;
    unmount: () => void;
};

function createHookHarness(): HookHarness {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const root = createRoot(container);
    const hookState: { current: ReturnType<typeof usePlacementController> | null } = {
        current: null,
    };

    function TestComponent(): null {
        hookState.current = usePlacementController();
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

        act(() => {
            resetPlacementStores();
        });
    });

    it('does not place a ship when the interaction does not resolve to place-ship', () => {
        const harness = createHookHarness();

        expect(harness.getCurrent().contract).toMatchObject({
            capabilities: {
                canConfirmFleet: false,
            },
            instruction: 'Select ship',
            feedback: null,
            stats: {
                remainingShips: 5,
            },
        });

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
        expect(harness.getCurrent().contract.feedback?.message).toBe('Ship placed successfully.');
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
        expect(harness.getCurrent().contract.feedback?.message).toBe('Ship repositioned successfully.');
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
        expect(harness.getCurrent().contract.feedback?.message).toBe('The ship overlaps another ship.');
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
        expect(harness.getCurrent().contract.feedback?.message).toBe('The ship does not fit on the board.');
        expect(harness.getCurrent().interaction.selectedShipType).toBe('carrier');

        harness.unmount();
    });

    it('assigns a new event identity when the same feedback message occurs again', () => {
        const harness = createHookHarness();
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

        triggerPlacementAt(harness, 'carrier', { row: 0, col: 0 });
        const firstEvent = harness.getCurrent().contract.feedback;

        triggerPlacementAt(harness, 'carrier', { row: 0, col: 0 });
        const secondEvent = harness.getCurrent().contract.feedback;

        expect(firstEvent?.message).toBe('The ship overlaps another ship.');
        expect(secondEvent?.message).toBe(firstEvent?.message);
        expect(secondEvent?.id).not.toBe(firstEvent?.id);

        harness.unmount();
    });
});
