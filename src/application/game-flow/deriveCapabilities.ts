import { GameState } from '@/lib/domain/game/models/GameState';
import { GamePhase } from '@/lib/domain/game/models/GamePhase';
import { GameStatus } from '@/lib/domain/game/models/GameStatus';

type GameInteractionCapabilities = {
    canInitializeGame: boolean; // GAME

    canPlaceShip: boolean; // PLACEMENT
    canConfirmFleet: boolean; // PLACEMENT

    canAttack: boolean; // BATTLE

    canRestartGame: boolean; // GAME 

    canInteractWithBoard: boolean; // PLACEMENT | GAME
    canInteractWithEnemyBoard: boolean; // BATTLE |GAME
};

const DEFAULT_CAPABILITIES: GameInteractionCapabilities = {
    canInitializeGame: false,

    canPlaceShip: false,
    canConfirmFleet: false,

    canAttack: false,

    canRestartGame: false,

    canInteractWithBoard: false,
    canInteractWithEnemyBoard: false,
}; 

export function deriveCapabilities(
    game: GameState,
): GameInteractionCapabilities {

    const { phase, status } = game;

    /**
     * SETUP
     */
    if (phase === GamePhase.SETUP) {
        return {
            ...DEFAULT_CAPABILITIES,
            canInitializeGame: true,
        };
    }

    /**
     * PLACEMENT
     */
    if (phase === GamePhase.PLACEMENT) {
        return {
            ...DEFAULT_CAPABILITIES,
            canPlaceShip: true,
            canInteractWithBoard: true,
            canConfirmFleet: true, // se refina con placementState en controller
        };
    }

    /**
     * BATTLE
     */

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

    /**
     * GAME OVER
     */

    if (phase === GamePhase.GAME_OVER) {
        return {
            ...DEFAULT_CAPABILITIES,

            canRestartGame: true,

            canInteractWithBoard: true,
        };
    }

    /**
     * Fallback
     */

    return DEFAULT_CAPABILITIES;
}