import { GamePhase } from '@/lib/domain/game/models/GamePhase';

import { GameState } from '@/lib/domain/game/models/GameState';

import { GameStatus } from '@/lib/domain/game/models/GameStatus';

import { GameInteractionCapabilities } from './game-flow-types';

import { PlacementCapabilities } from '@/application/placement/derive/placement-capabilites.types';

const DEFAULT_CAPABILITIES: GameInteractionCapabilities = {
    canInitializeGame: false,
    canPlaceFleet: false,
    canConfirmFleet: false,
    canInteractWithBoard: false,
    canAttack: false,
    canRestartGame: false,
    canInteractWithEnemyBoard: false,
};

export function deriveCapabilities(
    game: GameState,
    placementCapabilities: PlacementCapabilities
): GameInteractionCapabilities {

    const { phase, status } = game;

    if (phase === GamePhase.SETUP) {
        return {
            ...DEFAULT_CAPABILITIES,
            canInitializeGame: true,
        };
    }

    if (phase === GamePhase.PLACEMENT) {
        return {
            ...DEFAULT_CAPABILITIES,
            canPlaceFleet: true,
            canConfirmFleet:
                placementCapabilities.canConfirmFleet,
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


