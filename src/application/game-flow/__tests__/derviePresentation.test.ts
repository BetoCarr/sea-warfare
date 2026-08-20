import { derivePresentation } from '@/application/game-flow/derivePresentation';

import { GamePhase } from '@/lib/domain/game/models/GamePhase';

import { GameStatus } from '@/lib/domain/game/models/GameStatus';



import type { GameState } from '@/lib/domain/game/models/GameState';

function createGameState(
    overrides: Partial<GameState> = {},
): GameState {
    return {
        phase: GamePhase.SETUP,
        ...overrides,
    };
}

describe('derivePresentation', () => {
    it('returns setup presentation during SETUP', () => {
        const presentation = derivePresentation(
            createGameState(),
        );

        expect(presentation).toEqual({
            phaseLabel: 'BOOT',
            description: 'Combat systems are offline and awaiting initialization.',
            instruction: 'Initialize the game.'
        });
    });

    it('returns placement presentation during PLACEMENT', () => {
        const presentation = derivePresentation(
            createGameState({
                phase: GamePhase.PLACEMENT,
            }),
        );

        expect(presentation).toEqual({
            phaseLabel: 'DEPLOY',
            description: 'Fleet deployment in progress.',
            instruction: null
        });
    });

    it('returns battle presentation for PLAYER_TURN', () => {
        const presentation = derivePresentation(
            createGameState({
                phase: GamePhase.BATTLE,
                status: GameStatus.PLAYER_TURN,
                
            }),
        );

        expect(presentation).toEqual({
            phaseLabel: 'COMBAT',
            description: 'Your fleet has tactical initiative.',
            instruction: null
        });
    });

    it('returns battle presentation for AI_TURN', () => {
        const presentation = derivePresentation(
            createGameState({
                phase: GamePhase.BATTLE,
                status: GameStatus.AI_TURN,
            }),
        );

        expect(presentation).toEqual({
            phaseLabel: 'COMBAT',
            description: 'Enemy forces are executing their turn.',
            instruction: null
        });
    });

    it('returns game over presentation in GAME_OVER', () => {
        const presentation = derivePresentation(
            createGameState({
                phase: GamePhase.GAME_OVER,
            }),
        );

        expect(presentation).toEqual({
            phaseLabel: 'END',
            description: 'The mission has concluded.',
            instruction: null
        });
    });

    it('returns the default presentation for an unsupported combination', () => {
        const presentation = derivePresentation(
            createGameState({
                phase: GamePhase.BATTLE,
            }),
        );

        expect(presentation).toEqual({
            phaseLabel: '',
            description: null,
            instruction: null
        });
    });
});
