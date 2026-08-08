import { usePlacementInteractions } from './usePlacementInteractions';
import { usePlacementDerivations } from './usePlacementDerivations';
import { usePlacementMutations } from './usePlacementMutations';
import { usePlacementContract } from './usePlacementContract';

import { useGameplayStore } from '@/lib/store/gameplay-store';

export function usePlacement() {
    const playerPlacements = useGameplayStore(
        state => state.playerPlacements,
    );

    const interaction = usePlacementInteractions();

    const derivations = usePlacementDerivations({
        interaction,
        playerPlacements,
    });

    const mutations = usePlacementMutations({
        interaction,
        playerPlacements,
        preview: derivations.preview,
    });

    const contract = usePlacementContract(
        derivations,
    );

    return {
        playerPlacements,

        interaction,

        preview: derivations.preview,

        contract,

        mutations,
    };
}