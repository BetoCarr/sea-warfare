import { initialPlacementInteractionState } from './placement-interaction.initial';
import { usePlacementInteractionStore } from './placement-interaction.store';

function getInteractionSnapshot() {
    const state = usePlacementInteractionStore.getState();

    return {
        selectedShipType: state.selectedShipType,
        orientation: state.orientation,
        hoveredCell: state.hoveredCell,
    };
}

describe('usePlacementInteractionStore', () => {
    beforeEach(() => {
        usePlacementInteractionStore.setState(initialPlacementInteractionState);
    });

    it('should initialize with the default interaction state', () => {
        expect(usePlacementInteractionStore.getState().selectedShipType).toBeNull();
        expect(usePlacementInteractionStore.getState().orientation).toBe('horizontal');
        expect(usePlacementInteractionStore.getState().hoveredCell).toBeNull();
        expect(getInteractionSnapshot()).toEqual(initialPlacementInteractionState);
    });

    it('should update the selected ship type', () => {
        const store = usePlacementInteractionStore.getState();

        store.setSelectedShipType('carrier');

        expect(usePlacementInteractionStore.getState().selectedShipType).toBe('carrier');
    });

    it('should accept both horizontal and vertical orientations', () => {
        const store = usePlacementInteractionStore.getState();

        store.setOrientation('vertical');
        expect(usePlacementInteractionStore.getState().orientation).toBe('vertical');

        store.setOrientation('horizontal');
        expect(usePlacementInteractionStore.getState().orientation).toBe('horizontal');
    });

    it('should update and clear the hovered cell', () => {
        const store = usePlacementInteractionStore.getState();
        const hoveredCell = { row: 2, col: 4 };

        store.setHoveredCell(hoveredCell);
        expect(usePlacementInteractionStore.getState().hoveredCell).toEqual(hoveredCell);

        store.setHoveredCell(null);
        expect(usePlacementInteractionStore.getState().hoveredCell).toBeNull();
    });

    it('should reset placement interaction state to its initial values', () => {
        const store = usePlacementInteractionStore.getState();

        store.setSelectedShipType('destroyer');
        store.setOrientation('vertical');
        store.setHoveredCell({ row: 3, col: 5 });

        store.resetPlacementInteraction();

        expect(getInteractionSnapshot()).toEqual(initialPlacementInteractionState);
        expect(usePlacementInteractionStore.getState().selectedShipType).toBeNull();
        expect(usePlacementInteractionStore.getState().orientation).toBe('horizontal');
        expect(usePlacementInteractionStore.getState().hoveredCell).toBeNull();
    });

    it('should always reset to the same initial interaction snapshot', () => {
        const store = usePlacementInteractionStore.getState();

        store.setSelectedShipType('battleship');
        store.setOrientation('vertical');
        store.setHoveredCell({ row: 1, col: 1 });

        store.resetPlacementInteraction();
        const firstReset = getInteractionSnapshot();

        store.setSelectedShipType('submarine');
        store.setOrientation('horizontal');
        store.setHoveredCell({ row: 7, col: 8 });

        store.resetPlacementInteraction();
        const secondReset = getInteractionSnapshot();

        expect(firstReset).toEqual(secondReset);
        expect(firstReset).toEqual(initialPlacementInteractionState);
    });
});
