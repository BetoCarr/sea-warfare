import { GamePhase } from '../../models/GamePhase';
import { GameStatus } from '../../models/GameStatus';
import type { GameState } from '../../models/GameState';
import { initializeGame } from '../initializeGame';
import { confirmFleet } from '../confirmFleet';

function createGameState(overrides: Partial<GameState> = {}): GameState {
    return {
        phase: GamePhase.SETUP,
        status: GameStatus.IDLE,
        ...overrides,
    };
}

describe('game domain mutations', () => {
    describe('initializeGame', () => {
        it('transitions from SETUP + IDLE to PLACEMENT + PLACING_SHIPS', () => {
            const game = createGameState();

            const result = initializeGame({ game });

            expect(result).toEqual({
                phase: GamePhase.PLACEMENT,
                status: GameStatus.PLACING_SHIPS,
            });
        });

        it('rejects invalid lifecycle states', () => {
            const game = createGameState({
                phase: GamePhase.PLACEMENT,
                status: GameStatus.FLEET_READY,
            });

            expect(() => initializeGame({ game })).toThrow('Cannot execute initializeGame from current lifecycle state');
        });

        it('does not mutate the original state object', () => {
            const game = createGameState();
            const original = { ...game };

            initializeGame({ game });

            expect(game).toEqual(original);
        });
    });

    describe('confirmFleet', () => {
        it('transitions from PLACEMENT + FLEET_READY to BATTLE + PLAYER_TURN', () => {
            const game = createGameState({
                phase: GamePhase.PLACEMENT,
                status: GameStatus.FLEET_READY,
            });

            const result = confirmFleet({ game });

            expect(result).toEqual({
                phase: GamePhase.BATTLE,
                status: GameStatus.PLAYER_TURN,
            });
        });

        it('rejects invalid lifecycle states', () => {
            const game = createGameState({
                phase: GamePhase.PLACEMENT,
                status: GameStatus.PLACING_SHIPS,
            });

            expect(() => confirmFleet({ game })).toThrow('Cannot execute confirmFleet from current lifecycle state.');
        });

        it('does not mutate the original state object', () => {
            const game = createGameState({
                phase: GamePhase.PLACEMENT,
                status: GameStatus.FLEET_READY,
            });
            const original = { ...game };

            confirmFleet({ game });

            expect(game).toEqual(original);
        });
    });
});
