import { useGameplayStore } from '@/lib/store/gameplay-store';

import { confirmFleet as confirmFleetDomain } from '@/lib/domain/game/mutations/confirmFleet';
import { upsertShipPlacement } from '@/lib/domain/placement/mutations/upsertShipPlacement';

import type { PlacementMutations } from './placement-mutations.types';

import type { ShipPlacement } from '@/lib/domain/placement/models/ShipPlacement';

type UsePlacementMutationsParams = {
    playerPlacements: ShipPlacement[];
};

export function usePlacementMutations({
    playerPlacements,
}: UsePlacementMutationsParams): PlacementMutations {

    const game =
        useGameplayStore(
            state => state.game,
        );

    const setGame =
        useGameplayStore(
            state => state.setGame,
        );

    const setPlayerPlacements =
        useGameplayStore(
            state => state.setPlayerPlacements,
        );

    function placeShip(placement: ShipPlacement) {

        const result = upsertShipPlacement({
            existingPlacements: playerPlacements,
            placement,
        });

        if (!result.success) {
            return result;
        }

        setPlayerPlacements(
            result.placements,
        );

        return result;
    }

    function confirmFleet() {

        const nextGame =
            confirmFleetDomain({
                game,
            });

        setGame(nextGame);
    }

    return {
        placeShip,
        confirmFleet,
    };
}