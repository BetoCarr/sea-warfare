import { GamePhase } from '../models/GamePhase';
import { GameStatus } from '../models/GameStatus';

import type { GameState } from '../models/GameState';

export function confirmFleet({
    game,
}: {
    game: GameState;
}): GameState {
    return {
        ...game,
        phase: GamePhase.BATTLE,
        status: GameStatus.PLAYER_TURN,
    };
}
