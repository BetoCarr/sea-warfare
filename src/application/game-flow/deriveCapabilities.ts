import { GamePhase } from '@/lib/domain/game/models/GamePhase';

import { GameState } from '@/lib/domain/game/models/GameState';

import { GameStatus } from '@/lib/domain/game/models/GameStatus';

import { PlacementState } from '@/lib/domain/placement/models/PlacementState';

import { derivePlacementCapabilities } from '../placement/derive/derivePlacementCapabilities';

type GameInteractionCapabilities = {
    canInitializeGame: boolean;
    canPlaceShip: boolean;
    canConfirmFleet: boolean;
    canInteractWithBoard: boolean;
    canAttack: boolean;
    canRestartGame: boolean;
    canInteractWithEnemyBoard: boolean;
};

const DEFAULT_CAPABILITIES: GameInteractionCapabilities = {
    canInitializeGame: false,
    canPlaceShip: false,
    canConfirmFleet: false,
    canInteractWithBoard: false,
    canAttack: false,
    canRestartGame: false,
    canInteractWithEnemyBoard: false,
};

export function deriveCapabilities(
    game: GameState,
    placementState: PlacementState,
): GameInteractionCapabilities {

    const { phase, status } = game;

    if (phase === GamePhase.SETUP) {
        return {
            ...DEFAULT_CAPABILITIES,
            canInitializeGame: true,
        };
    }

    if (phase === GamePhase.PLACEMENT) {
        const placementCapabilities =
            derivePlacementCapabilities(placementState);

        return {
            ...DEFAULT_CAPABILITIES,
            ...placementCapabilities,
        };
    }

    if (phase === GamePhase.BATTLE && status === GameStatus.PLAYER_TURN) {
        return {
            ...DEFAULT_CAPABILITIES,
            canAttack: true,
            canInteractWithEnemyBoard: true,
        };
    }

    if (phase === GamePhase.BATTLE && status === GameStatus.AI_TURN) {
        return DEFAULT_CAPABILITIES;
    }

    if (phase === GamePhase.GAME_OVER) {
        return {
            ...DEFAULT_CAPABILITIES,
            canRestartGame: true,
        };
    }

    return DEFAULT_CAPABILITIES;
}


