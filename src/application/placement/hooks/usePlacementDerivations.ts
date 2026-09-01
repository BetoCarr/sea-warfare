import { useMemo } from 'react';

import { STANDARD_FLEET } from '@/lib/domain/ships/models/StandardFleet';

import { derivePlacementCapabilities } from '../derive/derivePlacementCapabilities';
import { derivePlacementInstruction } from '../derive/derivePlacementInstruction';
import { derivePlacementPreview } from '../derive/derivePlacementPreview';
import { derivePlacementStats } from '../derive/derivePlacementStats';

import type { ShipPlacement } from '@/lib/domain/placement/models/ShipPlacement';

import type { PlacementDerivations } from './placement-derivations.types';

import type { PlacementInteractionsContract } from './placement-interactions-contract.types';

type UsePlacementDerivationsParams = {
    interaction: PlacementInteractionsContract;
    playerPlacements: ShipPlacement[];
};

export function usePlacementDerivations({
    interaction,
    playerPlacements,
}: UsePlacementDerivationsParams): PlacementDerivations {

    const stats = useMemo(
        () =>
            derivePlacementStats({
                placements: playerPlacements,
                requiredFleet: STANDARD_FLEET,
            }),
        [playerPlacements],
    );

    const capabilities = useMemo(
        () =>
            derivePlacementCapabilities(
                stats
            ),
        [
            stats,
        ],
    );

    const preview = useMemo(
        () =>
            derivePlacementPreview({
                selectedShip: interaction.selectedShip,
                targetCell: interaction.targetCell,
                orientation: interaction.orientation,
                existingPlacements: playerPlacements,
            }),
        [
            interaction.selectedShip,
            interaction.targetCell,
            interaction.orientation,
            playerPlacements,
        ],
    );

    const instruction = useMemo(
        () =>
            derivePlacementInstruction({
                selectedShipType: interaction.selectedShipType,
                targetCell: interaction.targetCell,
                stats: stats,
            }),
        [
            interaction.selectedShipType,
            interaction.targetCell,
            stats,
        ],
    );


    return {
        stats,
        capabilities,
        preview,
        instruction,
    };
}