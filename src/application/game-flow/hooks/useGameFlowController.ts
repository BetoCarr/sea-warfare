import { composeGameFlowContent } from '../compose/composeGameFlowContent';
import { deriveCapabilities } from '../derive/deriveCapabilities';
import { deriveGlobalInstruction } from '../derive/deriveGlobalInstruction';
import { derivePresentation } from '../derive/derivePresentation';
import { useGameFlowFeedback } from './useGameFlowFeedback';

import { useGameplayStore } from "@/lib/store/gameplay-store";

import type { PlacementContract } from '@/application/placement/contract/placement-contract.types';
import type { GameFlowController } from "@/application/game-flow/game-flow-types";

interface UseGameFlowControllerProps {
    placement: Pick<PlacementContract, 'capabilities' | 'instruction' | 'feedback' | 'stats'>;
}

export function useGameFlowController({
    placement,
}: UseGameFlowControllerProps): GameFlowController {

    const game = useGameplayStore(state => state.game);

    const capabilities = deriveCapabilities(game, placement.capabilities);
    const presentation = derivePresentation(game);

    const content = composeGameFlowContent({
        game,
        globalInstruction: deriveGlobalInstruction(game),
        placement,
    });

    const feedback = useGameFlowFeedback(content.feedback);

    return {
        capabilities,
        presentation,
        ...content,
        feedback,
    };
}