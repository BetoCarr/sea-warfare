import { create } from 'zustand';

import type { PlacementInteractionState } from './placement-interaction.types';
import type { PlacementInteractionActions } from './placement-interaction.actions';
import { initialPlacementInteractionState } from './placement-interaction.initial';
import { Position } from '@/lib/domain/shared/models/Position';

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

        setActiveShipOrigin: (position) => {
            set({
                activeShipOrigin: position,
            });
        },

        resetPlacementInteraction: () => {
            set(initialPlacementInteractionState);
        },
    }));