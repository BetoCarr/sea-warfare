import { GamePhase } from '@/lib/domain/game/models/GamePhase';

import type { GameState } from '@/lib/domain/game/models/GameState';
import type { PlacementContract } from '@/application/placement/contract/placement-contract.types';
import type { GameFlowContent } from '../game-flow-types';

type ComposeGameFlowContentParams = {
    game: GameState;
    globalInstruction: string | null;
    placement: Pick<PlacementContract, 'instruction' | 'feedback' |  'stats'>;
};

export function composeGameFlowContent({
    game,
    globalInstruction,
    placement,
}: ComposeGameFlowContentParams): GameFlowContent {
    if (game.phase === GamePhase.PLACEMENT) {
        return {
            instruction: placement.instruction,
            feedback: placement.feedback,
            stats: `Remaining ships: ${placement.stats.remainingShips}`,
        };
    }

    return {
        instruction: globalInstruction,
        feedback: null,
        stats: null,
    };
}
