import { GamePhase } from '@/lib/domain/game/models/GamePhase';
import { GameStatus } from '@/lib/domain/game/models/GameStatus';

import type { GameState } from '@/lib/domain/game/models/GameState';

export function deriveGlobalInstruction(game: GameState): string | null {
    const { phase, status } = game;

    if (phase === GamePhase.SETUP) {
        return 'Initialize the game.';
    }

    if (phase === GamePhase.BATTLE && status === GameStatus.PLAYER_TURN) {
        return 'Choose an enemy target.';
    }

    return null;
}
