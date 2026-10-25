import { deriveCapabilities } from '@/application/game-flow/deriveCapabilities';

import { GamePhase } from '@/lib/domain/game/models/GamePhase';
import { GameStatus } from '@/lib/domain/game/models/GameStatus';

import type { GameState } from '@/lib/domain/game/models/GameState';
import type { PlacementCapabilities } from '@/application/placement/derive/placement-capabilites.types';

function createGameState(
    overrides: Partial<GameState> = {},
): GameState {
    return {
        phase: GamePhase.SETUP,
        ...overrides,
    };
}

const placementCanConfirm: PlacementCapabilities = {
    canConfirmFleet: true,
};

const placementCannotConfirm: PlacementCapabilities = {
    canConfirmFleet: false,
};

describe('deriveCapabilities', () => {
    it('enables initialization during SETUP', () => {
        const capabilities = deriveCapabilities(
            createGameState(),
            placementCannotConfirm,
        );

        expect(capabilities).toEqual({
            canInitializeGame: true,
            canRestartGame: false,
            canPlaceFleet: false,
            canConfirmFleet: false,
            canAttack: false,
        });
    });

    it('enables fleet placement during PLACEMENT', () => {
        const capabilities = deriveCapabilities(
            createGameState({
                phase: GamePhase.PLACEMENT,
            }),
            placementCannotConfirm,
        );

        expect(capabilities).toEqual({
            canInitializeGame: false,
            canRestartGame: false,
            canPlaceFleet: true,
            canConfirmFleet: false,
            canAttack: false,
        });
    });

    it('enables fleet confirmation during PLACEMENT when placement allows it', () => {
        const capabilities = deriveCapabilities(
            createGameState({
                phase: GamePhase.PLACEMENT,
            }),
            placementCanConfirm,
        );

        expect(capabilities).toEqual({
            canInitializeGame: false,
            canRestartGame: false,
            canPlaceFleet: true,
            canConfirmFleet: true,
            canAttack: false,
        });
    });

    it('enables attack during PLAYER_TURN', () => {
        const capabilities = deriveCapabilities(
            createGameState({
                phase: GamePhase.BATTLE,
                status: GameStatus.PLAYER_TURN,
            }),
            placementCanConfirm,
        );

        expect(capabilities).toEqual({
            canInitializeGame: false,
            canRestartGame: false,
            canPlaceFleet: false,
            canConfirmFleet: false,
            canAttack: true,
        });
    });

    it('does not enable any capabilities during AI_TURN', () => {
        const capabilities = deriveCapabilities(
            createGameState({
                phase: GamePhase.BATTLE,
                status: GameStatus.AI_TURN,
            }),
            placementCanConfirm,
        );

        expect(capabilities).toEqual({
            canInitializeGame: false,
            canRestartGame: false,
            canPlaceFleet: false,
            canConfirmFleet: false,
            canAttack: false,
        });
    });

    it('enables restart in GAME_OVER', () => {
        const capabilities = deriveCapabilities(
            createGameState({
                phase: GamePhase.GAME_OVER,
            }),
            placementCanConfirm,
        );

        expect(capabilities).toEqual({
            canInitializeGame: false,
            canRestartGame: true,
            canPlaceFleet: false,
            canConfirmFleet: false,
            canAttack: false,
        });
    });
});