import { useRef, useState } from 'react';

import { usePlacementInteractions } from './usePlacementInteractions';
import { usePlacementDerivations } from './usePlacementDerivations';
import { usePlacementMutations } from './usePlacementMutations';
import { usePlacementContract } from './usePlacementContract';

import { derivePlacementFeedback } from '../derive/derivePlacementFeedback';

import type { BoardCellInteraction, PlacementInteractionResult } from '../interactions/placement-interaction.types';

import type { PlacementController } from '@/application/placement/hooks/placement-controller.types';
import type { GameFlowFeedbackEvent } from '@/application/game-flow/game-flow-types';

import { useGameplayStore } from '@/lib/store/gameplay-store';

export function usePlacementController(): PlacementController {

    const playerPlacements = useGameplayStore(
        state => state.playerPlacements,
    );

    const [feedbackEvent, setFeedbackEvent] =
        useState<GameFlowFeedbackEvent | null>(null);

    const feedbackEventIdRef = useRef(0);

    const interaction = usePlacementInteractions();

    const derivations = usePlacementDerivations({
        interaction,
        playerPlacements,
    });

    const mutations = usePlacementMutations({
        playerPlacements,
    });

    const contract = usePlacementContract(
        derivations,
        feedbackEvent,
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

            const feedbackMessage = derivePlacementFeedback({
                mutationResult,
            });
            
            setFeedbackEvent(
                feedbackMessage
                    ? {
                        id: ++feedbackEventIdRef.current,
                        source: 'placement',
                        message: feedbackMessage,
                    }
                    : null,
            );

            if (mutationResult.success) {
                interaction.selectShip(null);
            }

            return null;
        },
    };


    return {
        playerPlacements,
        interaction: coordinatedInteraction,
        preview: derivations.preview,
        contract,
    };
}