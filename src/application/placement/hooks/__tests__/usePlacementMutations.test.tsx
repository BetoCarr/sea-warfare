import React, { act } from 'react';
import { createRoot } from 'react-dom/client';

import { GamePhase } from '@/lib/domain/game/models/GamePhase';
import { GameStatus } from '@/lib/domain/game/models/GameStatus';
import type { ShipPlacement } from '@/lib/domain/placement/models/ShipPlacement';
import type { UpsertShipPlacementResult } from '@/lib/domain/placement/models/UpsertShipPlacementResult';
import { useGameplayStore } from '@/lib/store/gameplay-store';

import { resetPlacementStores } from '../testing/resetPlacementStores';
import { usePlacementMutations } from '../usePlacementMutations';

declare global {
    var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}

type HookHarness = {
    getCurrent: () => ReturnType<typeof usePlacementMutations>;
    unmount: () => void;
};

function createHookHarness(playerPlacements: ShipPlacement[]): HookHarness {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const root = createRoot(container);
    const hookState: { current: ReturnType<typeof usePlacementMutations> | null } = {
        current: null,
    };

    function TestComponent(): null {
        hookState.current = usePlacementMutations({
            playerPlacements,
        });
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

describe('usePlacementMutations', () => {
    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        resetPlacementStores();
    });

    it('returns the successful placement result and updates player placements for a new ship', () => {
        const placement: ShipPlacement = {
            ship: { type: 'carrier', size: 5 },
            origin: { row: 0, col: 0 },
            orientation: 'horizontal',
        };

        const harness = createHookHarness([]);
        let result!: UpsertShipPlacementResult;

        act(() => {
            result = harness.getCurrent().placeShip(placement);
        });

        expect(result.success).toBe(true);
        if (!result.success) {
            throw new Error('Expected successful placement result');
        }

        expect(result.outcome).toBe('placed');
        expect(result.placements).toEqual([placement]);
        expect(useGameplayStore.getState().playerPlacements).toEqual(result.placements);

        harness.unmount();
    });

    it('returns a repositioned result and replaces the existing placement in the store', () => {
        const existingPlacement: ShipPlacement = {
            ship: { type: 'carrier', size: 5 },
            origin: { row: 0, col: 0 },
            orientation: 'horizontal',
        };

        const replacementPlacement: ShipPlacement = {
            ship: { type: 'carrier', size: 5 },
            origin: { row: 5, col: 2 },
            orientation: 'vertical',
        };

        useGameplayStore.setState({
            playerPlacements: [existingPlacement],
        });

        const harness = createHookHarness([existingPlacement]);
        let result!: UpsertShipPlacementResult;

        act(() => {
            result = harness.getCurrent().placeShip(replacementPlacement);
        });

        expect(result.success).toBe(true);
        if (!result.success) {
            throw new Error('Expected successful repositioning result');
        }

        expect(result.outcome).toBe('repositioned');
        expect(useGameplayStore.getState().playerPlacements).toEqual(result.placements);
        expect(useGameplayStore.getState().playerPlacements).toHaveLength(1);
        expect(useGameplayStore.getState().playerPlacements).toContain(replacementPlacement);
        expect(useGameplayStore.getState().playerPlacements).not.toContain(existingPlacement);

        harness.unmount();
    });

    it('propagates overlap failures without mutating player placements', () => {
        const existingPlacement: ShipPlacement = {
            ship: { type: 'destroyer', size: 2 },
            origin: { row: 0, col: 0 },
            orientation: 'horizontal',
        };

        const overlappingPlacement: ShipPlacement = {
            ship: { type: 'carrier', size: 5 },
            origin: { row: 0, col: 0 },
            orientation: 'horizontal',
        };

        useGameplayStore.setState({
            playerPlacements: [existingPlacement],
        });

        const harness = createHookHarness([existingPlacement]);
        let result!: UpsertShipPlacementResult;

        act(() => {
            result = harness.getCurrent().placeShip(overlappingPlacement);
        });

        expect(result).toEqual({
            success: false,
            error: 'OVERLAP',
        });
        expect(useGameplayStore.getState().playerPlacements).toEqual([existingPlacement]);

        harness.unmount();
    });

    it('propagates out-of-bounds failures without mutating player placements', () => {
        const placement: ShipPlacement = {
            ship: { type: 'carrier', size: 5 },
            origin: { row: 0, col: 6 },
            orientation: 'horizontal',
        };

        const harness = createHookHarness([]);
        let result!: UpsertShipPlacementResult;

        act(() => {
            result = harness.getCurrent().placeShip(placement);
        });

        expect(result).toEqual({
            success: false,
            error: 'OUT_OF_BOUNDS',
        });
        expect(useGameplayStore.getState().playerPlacements).toEqual([]);

        harness.unmount();
    });

    it('confirms the fleet by updating the game state through the domain mutation', () => {
        const placements: ShipPlacement[] = [
            {
                ship: { type: 'carrier', size: 5 },
                origin: { row: 0, col: 0 },
                orientation: 'horizontal',
            },
            {
                ship: { type: 'battleship', size: 4 },
                origin: { row: 1, col: 0 },
                orientation: 'horizontal',
            },
            {
                ship: { type: 'cruiser', size: 3 },
                origin: { row: 2, col: 0 },
                orientation: 'horizontal',
            },
            {
                ship: { type: 'submarine', size: 3 },
                origin: { row: 3, col: 0 },
                orientation: 'horizontal',
            },
            {
                ship: { type: 'destroyer', size: 2 },
                origin: { row: 4, col: 0 },
                orientation: 'horizontal',
            },
        ];

        useGameplayStore.setState({ playerPlacements: placements });

        const harness = createHookHarness(placements);

        act(() => {
            harness.getCurrent().confirmFleet();
        });

        expect(useGameplayStore.getState().game).toEqual({
            phase: GamePhase.BATTLE,
            status: GameStatus.PLAYER_TURN,
        });

        harness.unmount();
    });
});
