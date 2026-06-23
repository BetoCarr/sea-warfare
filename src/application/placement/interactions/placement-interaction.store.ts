import { create } from 'zustand';

import type { PlacementInteractionState } from './placement-interaction.types';
import type { PlacementInteractionActions } from './placement-interaction.actions';
import { initialPlacementInteractionState } from './placement-interaction.initial';

type PlacementInteractionStore =
    PlacementInteractionState &
    PlacementInteractionActions;

export const usePlacementInteractionStore =
    create<PlacementInteractionStore>((set) => ({
        ...initialPlacementInteractionState,


        setSelectedShipType: (shipType) => {
            set({
                selectedShipType: shipType,
            });
        },

        setOrientation: (orientation) => {
            set({
                orientation,
            });
        },

        setTargetCell: (position) => {
            set({
                targetCell: position,
            });
        },

        resetPlacementInteraction: () => {
            set(initialPlacementInteractionState);
        },
    }));