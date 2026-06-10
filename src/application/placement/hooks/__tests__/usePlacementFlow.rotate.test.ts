import { usePlacementInteractionStore } from '../../interactions/placement-interaction.store';
import { initialPlacementInteractionState } from '../../interactions/placement-interaction.initial';

import { executePlacementFlowAction } from '../testing/executePlacementFlowAction';
import { resetPlacementStores } from '../testing/resetPlacementStores';

declare global {
    var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}

describe('usePlacementFlow rotate', () => {
    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        resetPlacementStores();
    });

    it('rotates from horizontal to vertical', () => {
        usePlacementInteractionStore.setState({
            ...initialPlacementInteractionState,
            orientation: 'horizontal',
        });

        executePlacementFlowAction(flow => {
            flow.rotate();
        });

        expect(usePlacementInteractionStore.getState().orientation).toBe('vertical');
    });

    it('rotates from vertical to horizontal', () => {
        usePlacementInteractionStore.setState({
            ...initialPlacementInteractionState,
            orientation: 'vertical',
        });

        executePlacementFlowAction(flow => {
            flow.rotate();
        });

        expect(usePlacementInteractionStore.getState().orientation).toBe('horizontal');
    });

    it('preserves selected ship', () => {
        usePlacementInteractionStore.setState({
            ...initialPlacementInteractionState,
            selectedShipType: 'carrier',
            orientation: 'horizontal',
        });

        executePlacementFlowAction(flow => {
            flow.rotate();
        });

        expect(usePlacementInteractionStore.getState().selectedShipType).toBe('carrier');
    });

    it('preserves hovered cell', () => {
        const hoveredCell = { row: 3, col: 4 };

        usePlacementInteractionStore.setState({
            ...initialPlacementInteractionState,
            hoveredCell,
            orientation: 'horizontal',
        });

        executePlacementFlowAction(flow => {
            flow.rotate();
        });

        expect(usePlacementInteractionStore.getState().hoveredCell).toEqual(hoveredCell);
    });
});
