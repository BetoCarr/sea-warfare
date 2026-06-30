import { GamePhase } from '../../models/GamePhase';
import { GameStatus } from '../../models/GameStatus';
import type { GameState } from '../../models/GameState';

import { initializeGame } from '../initializeGame';
import { confirmFleet } from '../confirmFleet';

function createGameState(
    overrides: Partial<GameState> = {},
): GameState {
    return {
        phase: GamePhase.SETUP,
        ...overrides,
    };
}

describe('game domain mutations', () => {
    describe('initializeGame', () => {
        it('transitions from SETUP to PLACEMENT', () => {
            const game = createGameState();

            expect(initializeGame({ game })).toEqual({
                phase: GamePhase.PLACEMENT,
            });
        });

        it('does not mutate the original state object', () => {
            const game = createGameState();
            const original = { ...game };

            initializeGame({ game });

            expect(game).toEqual(original);
        });

        it('is deterministic', () => {
            const game = createGameState();

            expect(initializeGame({ game })).toEqual(
                initializeGame({ game }),
            );
        });
    });

    describe('confirmFleet', () => {
        it('transitions from PLACEMENT to BATTLE + PLAYER_TURN', () => {
            const game = createGameState({
                phase: GamePhase.PLACEMENT,
            });

            expect(confirmFleet({ game })).toEqual({
                phase: GamePhase.BATTLE,
                status: GameStatus.PLAYER_TURN,
            });
        });

        it('does not mutate the original state object', () => {
            const game = createGameState({
                phase: GamePhase.PLACEMENT,
            });
            const original = { ...game };

            confirmFleet({ game });

            expect(game).toEqual(original);
        });

        it('is deterministic', () => {
            const game = createGameState({
                phase: GamePhase.PLACEMENT,
            });

            expect(confirmFleet({ game })).toEqual(
                confirmFleet({ game }),
            );
        });
    });
});