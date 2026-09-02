import { GamePhase } from '../../models/GamePhase';

import { GameStatus } from '../../models/GameStatus';

import { confirmFleet } from '../confirmFleet';

import { initializeGame } from '../initializeGame';

import { STANDARD_FLEET } from '@/lib/domain/ships/models/StandardFleet';

import type { GameState } from '../../models/GameState';
import type { ShipPlacement } from '../../../placement/models/ShipPlacement';

function createGameState(
    overrides: Partial<GameState> = {},
): GameState {
    return {
        phase: GamePhase.SETUP,
        ...overrides,
    };
}

function createPlacement(shipType: string, row: number, col: number): ShipPlacement {
    const ship = STANDARD_FLEET.find(currentShip => currentShip.type === shipType)!;

    return {
        ship,
        origin: { row, col },
        orientation: 'horizontal',
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
        it('transitions from PLACEMENT to BATTLE + PLAYER_TURN when the fleet is complete', () => {
            const game = createGameState({
                phase: GamePhase.PLACEMENT,
            });
            const placements: ShipPlacement[] = [
                createPlacement('carrier', 0, 0),
                createPlacement('battleship', 1, 0),
                createPlacement('cruiser', 2, 0),
                createPlacement('submarine', 3, 0),
                createPlacement('destroyer', 4, 0),
            ];

            expect(confirmFleet({ game, placements })).toEqual({
                phase: GamePhase.BATTLE,
                status: GameStatus.PLAYER_TURN,
            });
        });

        it('does not transition to BATTLE when the fleet is incomplete', () => {
            const game = createGameState({
                phase: GamePhase.PLACEMENT,
            });
            const placements: ShipPlacement[] = [
                createPlacement('carrier', 0, 0),
                createPlacement('destroyer', 1, 0),
            ];

            expect(confirmFleet({ game, placements })).toEqual(game);
        });

        it('does not mutate the original state object', () => {
            const game = createGameState({
                phase: GamePhase.PLACEMENT,
            });
            const original = { ...game };

            confirmFleet({ game, placements: [] });

            expect(game).toEqual(original);
        });

        it('is deterministic', () => {
            const game = createGameState({
                phase: GamePhase.PLACEMENT,
            });
            const placements: ShipPlacement[] = [
                createPlacement('carrier', 0, 0),
                createPlacement('battleship', 1, 0),
                createPlacement('cruiser', 2, 0),
                createPlacement('submarine', 3, 0),
                createPlacement('destroyer', 4, 0),
            ];

            expect(confirmFleet({ game, placements })).toEqual(
                confirmFleet({ game, placements }),
            );
        });
    });
});