import React, { act } from 'react';
import { createRoot } from 'react-dom/client';

import { usePlacementInteractionStore } from '../../interactions/placement-interaction.store';
import { usePlacementInteractions } from '../usePlacementInteractions';
import { usePlacementDerivations } from '../usePlacementDerivations';

import { resetPlacementStores } from '../testing/resetPlacementStores';
import { createCompleteFleetPlacements, carrier, destroyer } from '../testing/placement-test-data';

import { useGameplayStore } from '@/lib/store/gameplay-store';
import { STANDARD_FLEET } from '@/lib/domain/ships/models/StandardFleet';

import type { ShipPlacement } from '@/lib/domain/placement/models/ShipPlacement';

declare global {
    var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}

type HookHarness = {
    getCurrent: () => ReturnType<typeof usePlacementDerivations>;
    unmount: () => void;
};

function createHookHarness(): HookHarness {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const root = createRoot(container);
    const hookState: { current: ReturnType<typeof usePlacementDerivations> | null } = {
        current: null,
    };

    function TestComponent(): null {
        const interaction = usePlacementInteractions();
        const playerPlacements = useGameplayStore(state => state.playerPlacements);

        hookState.current = usePlacementDerivations({
            interaction,
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

describe('usePlacementDerivations', () => {
    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        resetPlacementStores();
    });

    it('returns initial fleet stats, no confirm capability, no preview and select-ship instruction when no ships are placed', () => {
        const harness = createHookHarness();

        const derivations = harness.getCurrent();

        expect(derivations.stats.remainingShips).toBe(STANDARD_FLEET.length);
        expect(derivations.stats.remainingShipTypes).toEqual(
            STANDARD_FLEET.map(ship => ship.type),
        );
        expect(derivations.capabilities.canConfirmFleet).toBe(false);
        expect(derivations.preview).toBeNull();
        expect(derivations.instruction).toBe('Select ship');

        harness.unmount();
    });

    it('reduces remaining fleet stats while some ships are already placed', () => {
        const placedCarrier: ShipPlacement = {
            ship: carrier,
            origin: { row: 0, col: 0 },
            orientation: 'horizontal',
        };

        const placedDestroyer: ShipPlacement = {
            ship: destroyer,
            origin: { row: 5, col: 5 },
            orientation: 'vertical',
        };

        useGameplayStore.setState({
            playerPlacements: [placedCarrier, placedDestroyer],
        });

        const harness = createHookHarness();

        const derivations = harness.getCurrent();

        expect(derivations.stats.remainingShips).toBe(3);
        expect(derivations.stats.remainingShipTypes).toEqual([
            'battleship',
            'cruiser',
            'submarine',
        ]);
        expect(derivations.capabilities.canConfirmFleet).toBe(false);

        harness.unmount();
    });

    it('returns no remaining ships and enables fleet confirmation when the fleet is complete', () => {
        useGameplayStore.setState({
            playerPlacements: createCompleteFleetPlacements(),
        });

        const harness = createHookHarness();

        const derivations = harness.getCurrent();

        expect(derivations.stats.remainingShips).toBe(0);
        expect(derivations.stats.remainingShipTypes).toEqual([]);
        expect(derivations.capabilities.canConfirmFleet).toBe(true);
        expect(derivations.instruction).toBe('Confirm fleet');

        harness.unmount();
    });

    it('returns no preview and a select-position instruction when a ship is selected but no target cell exists', () => {
        usePlacementInteractionStore.setState({
            selectedShipType: 'carrier',
            orientation: 'horizontal',
            targetCell: null,
        });

        const harness = createHookHarness();

        const derivations = harness.getCurrent();

        expect(derivations.preview).toBeNull();
        expect(derivations.instruction).toBe('Select position');

        harness.unmount();
    });

    it('returns a valid preview and a place-ship instruction when a ship is selected and a valid target cell exists', () => {
        usePlacementInteractionStore.setState({
            selectedShipType: 'carrier',
            orientation: 'horizontal',
            targetCell: { row: 0, col: 0 },
        });

        const harness = createHookHarness();

        const derivations = harness.getCurrent();

        expect(derivations.preview).not.toBeNull();
        if (!derivations.preview) {
            throw new Error('Expected preview for valid placement');
        }

        expect(derivations.preview.isValid).toBe(true);
        expect(derivations.preview.cells).toEqual([
            { row: 0, col: 0 },
            { row: 0, col: 1 },
            { row: 0, col: 2 },
            { row: 0, col: 3 },
            { row: 0, col: 4 },
        ]);
        expect(derivations.instruction).toBe('Place ship');

        harness.unmount();
    });

    it('returns an invalid preview while keeping the place-ship instruction when the target cell is invalid', () => {
        usePlacementInteractionStore.setState({
            selectedShipType: 'carrier',
            orientation: 'horizontal',
            targetCell: { row: 0, col: 6 },
        });

        const harness = createHookHarness();

        const derivations = harness.getCurrent();

        expect(derivations.preview).not.toBeNull();
        if (!derivations.preview || derivations.preview.isValid) {
            throw new Error('Expected invalid preview');
        }

        expect(derivations.preview.validationError).toBe('OUT_OF_BOUNDS');
        expect(derivations.instruction).toBe('Place ship');

        harness.unmount();
    });
});
