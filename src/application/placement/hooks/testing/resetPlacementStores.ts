import { initialPlacementInteractionState } from '../../interactions/placement-interaction.initial';

import { usePlacementInteractionStore } from '../../interactions/placement-interaction.store';

import { useGameplayStore } from '@/lib/store/gameplay/gameplay-store';

import { initialGameplayState } from '@/lib/store/gameplay/gameplay-store.initial';

export function resetPlacementStores(): void {
    useGameplayStore.setState({
        ...initialGameplayState,
        playerPlacements: [],
    });

    usePlacementInteractionStore.setState({
        ...initialPlacementInteractionState,
        selectedShipType: null,
        targetCell: null,
        orientation: 'horizontal',
    });
}
