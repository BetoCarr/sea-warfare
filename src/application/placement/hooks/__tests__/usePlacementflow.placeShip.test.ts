import { useGameplayStore } from '@/lib/store/gameplay/gameplay-store';
import { usePlacementInteractionStore } from '../../interactions/placement-interaction.store';
import { initialPlacementInteractionState } from '../../interactions/placement-interaction.initial';

import { executePlacementFlowAction } from '../testing/executePlacementFlowAction';
import { resetPlacementStores } from '../testing/resetPlacementStores';
import { placementGameState } from '../testing/placementGameState';
import { carrier, createDestroyerPlacement } from '../testing/placement-test-data';

declare global {
    var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}

describe('usePlacementFlow placeShip', () => {
    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        resetPlacementStores();
    });

    it('creates a new placement when the selected ship can be placed', () => {
        usePlacementInteractionStore.setState({
            ...initialPlacementInteractionState,
            selectedShipType: 'carrier',
            hoveredCell: { row: 0, col: 0 },
            orientation: 'horizontal',
        });

        executePlacementFlowAction(flow => {
            flow.placeShip();
        });

        expect(useGameplayStore.getState().playerPlacements).toEqual([
            {
                ship: carrier,
                origin: { row: 0, col: 0 },
                orientation: 'horizontal',
            },
        ]);
        expect(usePlacementInteractionStore.getState().selectedShipType).toBeNull();
    });

    it('replaces an existing placement when the same ship is placed again', () => {
        useGameplayStore.setState({
            ...placementGameState,
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

        executePlacementFlowAction(flow => {
            flow.placeShip();
        });

        expect(useGameplayStore.getState().playerPlacements).toHaveLength(1);
        expect(useGameplayStore.getState().playerPlacements[0]).toEqual({
            ship: carrier,
            origin: { row: 0, col: 5 },
            orientation: 'horizontal',
        });
        expect(usePlacementInteractionStore.getState().selectedShipType).toBeNull();
    });

    it('does not mutate placements when placement validation fails', () => {
        const initialPlacements = [createDestroyerPlacement()];

        useGameplayStore.setState({
            ...placementGameState,
            playerPlacements: initialPlacements,
        });

        usePlacementInteractionStore.setState({
            ...initialPlacementInteractionState,
            selectedShipType: 'carrier',
            hoveredCell: { row: 0, col: 7 },
            orientation: 'horizontal',
        });

        executePlacementFlowAction(flow => {
            flow.placeShip();
        });

        expect(useGameplayStore.getState().playerPlacements).toEqual(initialPlacements);
        expect(usePlacementInteractionStore.getState().selectedShipType).toBe('carrier');
    });

    it('does nothing when no ship is selected', () => {
        const initialPlacements = [createDestroyerPlacement()];

        useGameplayStore.setState({
            ...placementGameState,
            playerPlacements: initialPlacements,
        });

        usePlacementInteractionStore.setState({
            ...initialPlacementInteractionState,
            selectedShipType: null,
            hoveredCell: { row: 0, col: 0 },
            orientation: 'horizontal',
        });

        executePlacementFlowAction(flow => {
            flow.placeShip();
        });

        expect(useGameplayStore.getState().playerPlacements).toEqual(initialPlacements);
    });

    it('does nothing when no hovered cell exists', () => {
        const initialPlacements = [createDestroyerPlacement()];

        useGameplayStore.setState({
            ...placementGameState,
            playerPlacements: initialPlacements,
        });

        usePlacementInteractionStore.setState({
            ...initialPlacementInteractionState,
            selectedShipType: 'carrier',
            hoveredCell: null,
            orientation: 'horizontal',
        });

        executePlacementFlowAction(flow => {
            flow.placeShip();
        });

        expect(useGameplayStore.getState().playerPlacements).toEqual(initialPlacements);
    });
});
