import { GamePhase } from '../models/GamePhase';
import { GameState } from '../models/GameState';
import { GameStatus } from '../models/GameStatus';
import { canInitializeGame } from '../rules/gameLifecycleRules';

export type InitializeGameParams = {
    game: GameState;
};

export function initializeGame({
    game,
}: InitializeGameParams): GameState {
    if (!canInitializeGame(game)) {
        throw new Error('Cannot execute initializeGame from current lifecycle state.');
    }

    return {
        ...game,
        phase: GamePhase.PLACEMENT,
        status: GameStatus.PLACING_SHIPS,
    };
}