import type { GameState } from '../models/GameState';
import { GamePhase } from '../models/GamePhase';
import { GameStatus } from '../models/GameStatus';

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
