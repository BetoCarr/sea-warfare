import { useGameplayStore } from '@/lib/store/gameplay-store';
import { usePlacementInteractionStore } from '../interactions/placement-interaction.store';

import { confirmFleet as confirmFleetDomain } from '@/lib/domain/game/mutations/confirmFleet';
import { upsertShipPlacement } from '@/lib/domain/placement/mutations/upsertShipPlacement';

import type { PlacementMutations } from './placement-mutations.types';

import type { PlacementInteractionsContract } from './placement-interactions-contract.types';
import type { PlacementPreview } from '../derive/placement-preview.types';

import type { ShipPlacement } from '@/lib/domain/placement/models/ShipPlacement';

type UsePlacementMutationsParams = {
    interaction: PlacementInteractionsContract;

    preview: PlacementPreview | null;

    playerPlacements: ShipPlacement[];
};

// TODO:
// Revisit whether clearing interaction state belongs here.
// Domain mutations should not own interaction lifecycle.
// Evaluate after removing usePlacementFlow.

export function usePlacementMutations({
    interaction,
    preview,
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

    const setSelectedShipType =
        usePlacementInteractionStore(
            state => state.setSelectedShipType,
        );

    const setTargetCell =
        usePlacementInteractionStore(
            state => state.setTargetCell,
        );

    function placeShip() {

        if (
            !interaction.selectedShip ||
            !interaction.targetCell ||
            !preview?.isValid
        ) {
            return null;
        }

        const placement = {
            ship: interaction.selectedShip,
            origin: interaction.targetCell,
            orientation: interaction.orientation,
        };

        const result = upsertShipPlacement({
            existingPlacements: playerPlacements,
            placement,
        });

        if (!result.success) {
            return null;
        }

        setPlayerPlacements(
            result.placements,
        );

        setSelectedShipType(null);

        setTargetCell(null);

        return result.outcome;
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