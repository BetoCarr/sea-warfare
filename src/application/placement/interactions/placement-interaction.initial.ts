import type { PlacementInteractionState } from './placement-interaction.types';

export const initialPlacementInteractionState:
    PlacementInteractionState = {
    selectedShipType: null,
    orientation: 'horizontal',
    targetCell: null,
};