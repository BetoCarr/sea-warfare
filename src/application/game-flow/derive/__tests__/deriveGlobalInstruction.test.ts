import { deriveGlobalInstruction } from '@/application/game-flow/derive/deriveGlobalInstruction';

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

describe('deriveGlobalInstruction', () => {
    it('returns the initialization instruction during SETUP', () => {
        const instruction = deriveGlobalInstruction(
            createGameState(),
        );

        expect(instruction).toBe('Initialize the game.');
    });

    it('returns the target selection instruction during PLAYER_TURN', () => {
        const instruction = deriveGlobalInstruction(
            createGameState({
                phase: GamePhase.BATTLE,
                status: GameStatus.PLAYER_TURN,
            }),
        );

        expect(instruction).toBe('Choose an enemy target.');
    });

    it('returns null during AI_TURN', () => {
        const instruction = deriveGlobalInstruction(
            createGameState({
                phase: GamePhase.BATTLE,
                status: GameStatus.AI_TURN,
            }),
        );

        expect(instruction).toBeNull();
    });

    it('returns null during PLACEMENT', () => {
        const instruction = deriveGlobalInstruction(
            createGameState({
                phase: GamePhase.PLACEMENT,
            }),
        );

        expect(instruction).toBeNull();
    });

    it('returns null during GAME_OVER', () => {
        const instruction = deriveGlobalInstruction(
            createGameState({
                phase: GamePhase.GAME_OVER,
            }),
        );

        expect(instruction).toBeNull();
    });
});