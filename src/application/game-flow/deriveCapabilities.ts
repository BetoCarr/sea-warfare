import { GameState } from '@/lib/domain/game/models/GameState';
import { GamePhase } from '@/lib/domain/game/models/GamePhase';
import { GameStatus } from '@/lib/domain/game/models/GameStatus';

type GameInteractionCapabilities = {
    canInitializeGame: boolean;
    canAttack: boolean;
    canRestartGame: boolean;
    canInteractWithEnemyBoard: boolean;
};

const DEFAULT_CAPABILITIES: GameInteractionCapabilities = {
    canInitializeGame: false,
    canAttack: false,
    canRestartGame: false,
    canInteractWithEnemyBoard: false,
};

export function deriveCapabilities(
    game: GameState,
): GameInteractionCapabilities {

    const { phase, status } = game;

    if (phase === GamePhase.SETUP) {
        return {
            ...DEFAULT_CAPABILITIES,
            canInitializeGame: true,
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


