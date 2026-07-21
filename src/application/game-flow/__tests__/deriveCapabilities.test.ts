import { deriveCapabilities } from '@/application/game-flow/deriveCapabilities';

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

describe('deriveCapabilities', () => {
    it('enables initialization during SETUP', () => {
        const capabilities = deriveCapabilities(
            createGameState(),
        );

        expect(capabilities).toEqual({
            canInitializeGame: true,
            canAttack: false,
            canRestartGame: false,
            canInteractWithEnemyBoard: false,
        });
    });

    it('enables attack and enemy board interaction during PLAYER_TURN', () => {
        const capabilities = deriveCapabilities(
            createGameState({
                phase: GamePhase.BATTLE,
                status: GameStatus.PLAYER_TURN,
            }),
        );

        expect(capabilities).toEqual({
            canInitializeGame: false,
            canAttack: true,
            canRestartGame: false,
            canInteractWithEnemyBoard: true,
        });
    });

    it('does not enable any abilities during AI_TURN', () => {
        const capabilities = deriveCapabilities(
            createGameState({
                phase: GamePhase.BATTLE,
                status: GameStatus.AI_TURN,
            }),
        );

        expect(capabilities).toEqual({
            canInitializeGame: false,
            canAttack: false,
            canRestartGame: false,
            canInteractWithEnemyBoard: false,
        });
    });

    it('enables restart in GAME_OVER', () => {
        const capabilities = deriveCapabilities(
            createGameState({
                phase: GamePhase.GAME_OVER,
            }),
        );

        expect(capabilities).toEqual({
            canInitializeGame: false,
            canAttack: false,
            canRestartGame: true,
            canInteractWithEnemyBoard: false,
        });
    });
});
