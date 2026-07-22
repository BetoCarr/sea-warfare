import { initialPlacementInteractionState } from '../../interactions/placement-interaction.initial';

import { usePlacementInteractionStore } from '../../interactions/placement-interaction.store';

import { executePlacementFlowAction } from '../testing/executePlacementFlowAction';

import { carrier, createDestroyerPlacement } from '../testing/placement-test-data';

import { placementGameState } from '../testing/placementGameState';

import { resetPlacementStores } from '../testing/resetPlacementStores';

import { useGameplayStore } from '@/lib/store/gameplay-store';

declare global {
    var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}

describe('onBoardInteraction', () => {
    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        resetPlacementStores();
    });

    it('selects a ship when interacting with an occupied cell', () => {
        executePlacementFlowAction(flow => {
            flow.onBoardInteraction({
                position: { row: 0, col: 0 },
                shipType: 'carrier',
            });
        });

        expect(usePlacementInteractionStore.getState().selectedShipType).toBe('carrier');
        expect(usePlacementInteractionStore.getState().targetCell).toEqual({ row: 0, col: 0 });
    });

    it('sets target cell when no ship is selected', () => {
        executePlacementFlowAction(flow => {
            flow.onBoardInteraction({
                position: { row: 2, col: 3 },
            });
        });

        expect(usePlacementInteractionStore.getState().targetCell).toEqual({ row: 2, col: 3 });
    });

    it('updates target cell when selecting a different cell', () => {
        usePlacementInteractionStore.setState({
            ...initialPlacementInteractionState,
            targetCell: { row: 1, col: 1 },
        });

        executePlacementFlowAction(flow => {
            flow.onBoardInteraction({
                position: { row: 4, col: 5 },
            });
        });

        expect(usePlacementInteractionStore.getState().targetCell).toEqual({ row: 4, col: 5 });
    });

    it('places ship when interacting with the active target cell', () => {
        usePlacementInteractionStore.setState({
            ...initialPlacementInteractionState,
            selectedShipType: 'carrier',
            targetCell: { row: 0, col: 0 },
            orientation: 'horizontal',
        });

        executePlacementFlowAction(flow => {
            flow.onBoardInteraction({
                position: { row: 0, col: 0 },
            });
        });

        expect(useGameplayStore.getState().playerPlacements).toEqual([
            {
                ship: carrier,
                origin: { row: 0, col: 0 },
                orientation: 'horizontal',
            },
        ]);
        expect(usePlacementInteractionStore.getState().selectedShipType).toBeNull();
        expect(usePlacementInteractionStore.getState().targetCell).toBeNull();
    });

    it('allows an already placed ship to re-enter placement flow', () => {
        useGameplayStore.setState({
            ...placementGameState,
            playerPlacements: [createDestroyerPlacement()],
        });

        executePlacementFlowAction(flow => {
            flow.onBoardInteraction({
                position: { row: 0, col: 0 },
                shipType: 'destroyer',
            });
        });

        expect(usePlacementInteractionStore.getState().selectedShipType).toBe('destroyer');
        expect(usePlacementInteractionStore.getState().targetCell).toEqual({ row: 0, col: 0 });
    });
});

describe('onBoardLeave', () => {
    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        resetPlacementStores();
    });

    it('clears targetCell when no ship is selected', () => {
        usePlacementInteractionStore.setState({
            ...initialPlacementInteractionState,
            targetCell: { row: 2, col: 2 },
        });

        executePlacementFlowAction(flow => {
            flow.onBoardLeave();
        });

        expect(usePlacementInteractionStore.getState().targetCell).toBeNull();
    });

    it('preserves targetCell while repositioning a ship', () => {
        const targetCell = { row: 3, col: 4 };

        usePlacementInteractionStore.setState({
            ...initialPlacementInteractionState,
            selectedShipType: 'carrier',
            targetCell,
        });

        executePlacementFlowAction(flow => {
            flow.onBoardLeave();
        });

        expect(usePlacementInteractionStore.getState().targetCell).toEqual(targetCell);
        expect(usePlacementInteractionStore.getState().selectedShipType).toBe('carrier');
    });
});
