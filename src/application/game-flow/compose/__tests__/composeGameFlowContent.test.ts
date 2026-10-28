import { composeGameFlowContent } from '@/application/game-flow/compose/composeGameFlowContent';
import { deriveGlobalInstruction } from '@/application/game-flow/derive/deriveGlobalInstruction';

import { GamePhase } from '@/lib/domain/game/models/GamePhase';
import { GameStatus } from '@/lib/domain/game/models/GameStatus';

import type { GameState } from '@/lib/domain/game/models/GameState';
import type { PlacementContract } from '@/application/placement/contract/placement-contract.types';

function createGameState(
    overrides: Partial<GameState> = {},
): GameState {
    return {
        phase: GamePhase.SETUP,
        ...overrides,
    };
}

const placementFeedback: NonNullable<PlacementContract['feedback']> = {
    id: 1,
    source: 'placement',
    message: 'Ship placed successfully.',
};

const placementContent: Pick<
    PlacementContract,
    'instruction' | 'feedback' | 'stats'
> = {
    instruction: 'Select ship',
    feedback: placementFeedback,
    stats: {
        remainingShips: 3,
        remainingShipTypes: [],
    },
};

describe('composeGameFlowContent', () => {
    it('uses the global setup instruction and excludes Placement content outside PLACEMENT', () => {
        const game = createGameState();

        expect(
            composeGameFlowContent({
                game,
                globalInstruction: deriveGlobalInstruction(game),
                placement: placementContent,
            }),
        ).toEqual({
            instruction: 'Initialize the game.',
            feedback: null,
            stats: null,
        });
    });

    it('uses Placement content during PLACEMENT', () => {
        const game = createGameState({
            phase: GamePhase.PLACEMENT,
        });

        expect(
            composeGameFlowContent({
                game,
                globalInstruction: deriveGlobalInstruction(game),
                placement: placementContent,
            }),
        ).toEqual({
            instruction: 'Select ship',
            feedback: placementFeedback,
            stats: 'Remaining ships: 3',
        });
    });

    it('preserves null feedback during PLACEMENT', () => {
        const game = createGameState({
            phase: GamePhase.PLACEMENT,
        });

        expect(
            composeGameFlowContent({
                game,
                globalInstruction: deriveGlobalInstruction(game),
                placement: {
                    ...placementContent,
                    feedback: null,
                },
            }),
        ).toEqual({
            instruction: 'Select ship',
            feedback: null,
            stats: 'Remaining ships: 3',
        });
    });

    it('uses the global battle instruction and excludes Placement content', () => {
        const game = createGameState({
            phase: GamePhase.BATTLE,
            status: GameStatus.PLAYER_TURN,
        });

        expect(
            composeGameFlowContent({
                game,
                globalInstruction: deriveGlobalInstruction(game),
                placement: placementContent,
            }),
        ).toEqual({
            instruction: 'Choose an enemy target.',
            feedback: null,
            stats: null,
        });
    });

    it('returns no instruction, feedback, or stats during GAME_OVER', () => {
        const game = createGameState({
            phase: GamePhase.GAME_OVER,
        });

        expect(
            composeGameFlowContent({
                game,
                globalInstruction: deriveGlobalInstruction(game),
                placement: placementContent,
            }),
        ).toEqual({
            instruction: null,
            feedback: null,
            stats: null,
        });
    });
});