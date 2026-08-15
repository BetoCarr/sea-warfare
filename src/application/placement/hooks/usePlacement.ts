import { useEffect, useMemo, useRef, useState } from 'react';

import { usePlacementInteractions } from './usePlacementInteractions';
import { usePlacementDerivations } from './usePlacementDerivations';
import { usePlacementMutations } from './usePlacementMutations';
import { usePlacementContract } from './usePlacementContract';

import { derivePlacementFeedback } from '../derive/derivePlacementFeedback';

import type { BoardCellInteraction, PlacementInteractionResult } from '../interactions/placement-interaction.types';

import type { UpsertShipPlacementResult } from '@/lib/domain/placement/models/UpsertShipPlacementResult';

import { useGameplayStore } from '@/lib/store/gameplay-store';

const FEEDBACK_DURATION = 4000;

export function usePlacement() {

    const playerPlacements = useGameplayStore(
        state => state.playerPlacements,
    );

    const [mutationResult, setMutationResult] =
        useState<UpsertShipPlacementResult | null>(null);

    const feedbackTimeoutRef =
        useRef<ReturnType<typeof setTimeout> | null>(null)

    const interaction = usePlacementInteractions();

    const derivations = usePlacementDerivations({
        interaction,
        playerPlacements,
    });

    const mutations = usePlacementMutations({
        playerPlacements,
    });

    const feedback = useMemo(
        () =>
            derivePlacementFeedback({
                mutationResult,
            }),
        [mutationResult],
    );

    const contract = usePlacementContract(
        derivations,
        feedback,
    );

    const coordinatedInteraction = {
        ...interaction,
        onBoardInteraction: (
            boardInteraction: BoardCellInteraction,
        ): PlacementInteractionResult => {

            const interactionResult = interaction.onBoardInteraction(boardInteraction);

            if (interactionResult?.type !== 'place-ship') {
                return interactionResult;
            }

            const ship = interaction.selectedShip;
            const origin = interaction.targetCell;
            const orientation = interaction.orientation;

            if (!ship || !origin) {
                return null;
            }

            const placement = {
                ship,
                origin,
                orientation,
            };

            const mutationResult = mutations.placeShip(placement);

            if (feedbackTimeoutRef.current) {
                clearTimeout(feedbackTimeoutRef.current);
            }

            setMutationResult(mutationResult);

            feedbackTimeoutRef.current = setTimeout(() => {
                setMutationResult(null);
                feedbackTimeoutRef.current = null;
            }, FEEDBACK_DURATION);


            if (mutationResult.success) {
                interaction.selectShip(null);
            }

            return null;
        },
    };


    useEffect(() => {
        return () => {
            if (feedbackTimeoutRef.current) {
                clearTimeout(feedbackTimeoutRef.current);
            }
        };
    }, []);

    return {
        playerPlacements,

        interaction: coordinatedInteraction,

        preview: derivations.preview,

        contract,

        mutations,
    };
}