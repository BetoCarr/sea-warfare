import { useMemo } from 'react';

import { STANDARD_FLEET } from '@/lib/domain/ships/models/StandardFleet';

import { derivePlacementCapabilities } from '../derive/derivePlacementCapabilities';
import { derivePlacementFeedback } from '../derive/derivePlacementFeedback';
import { derivePlacementInstruction } from '../derive/derivePlacementInstruction';
import { derivePlacementPreview } from '../derive/derivePlacementPreview';
import { derivePlacementStats } from '../derive/derivePlacementStats';

import type { PlacementOutcome } from '@/lib/domain/placement/models/PlacementOutcome';
import type { ShipPlacement } from '@/lib/domain/placement/models/ShipPlacement';

import type { PlacementDerivations } from './placement-derivations.types';

import type { PlacementInteractionsContract } from './placement-interactions-contract.types';

type UsePlacementDerivationsParams = {
    interactions: PlacementInteractionsContract;

    playerPlacements: ShipPlacement[];

    outcome?: PlacementOutcome | null;
};

export function usePlacementDerivations({
    interactions,
    playerPlacements,
    outcome = null,
}: UsePlacementDerivationsParams): PlacementDerivations {

    const preview = useMemo(
        () =>
            derivePlacementPreview({
                selectedShip: interactions.selectedShip,
                targetCell: interactions.targetCell,
                orientation: interactions.orientation,
                existingPlacements: playerPlacements,
            }),
        [
            interactions.selectedShip,
            interactions.targetCell,
            interactions.orientation,
            playerPlacements,
        ],
    );

    const stats = useMemo(
        () =>
            derivePlacementStats({
                placements: playerPlacements,
                requiredFleet: STANDARD_FLEET,
            }),
        [playerPlacements],
    );

    // const capabilities = useMemo(
    //     () =>
    //         derivePlacementCapabilities({
    //             preview,
    //             stats,
    //         }),
    //     [
    //         preview,
    //         stats,
    //     ],
    // );

    const instruction = useMemo(
        () =>
            derivePlacementInstruction({
                selectedShipType: interactions.selectedShipType,
                preview,
                capabilities,
            }),
        [
            interactions.selectedShipType,
            preview,
            capabilities,
        ],
    );

    const feedback = useMemo(
        () =>
            derivePlacementFeedback({
                preview,
                outcome,
            }),
        [
            preview,
            outcome,
        ],
    );

    return {
        preview,
        capabilities,
        instruction,
        feedback,
        stats,
    };
}