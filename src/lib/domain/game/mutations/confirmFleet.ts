import { GamePhase } from '../models/GamePhase';
import { GameState } from '../models/GameState';
import { GameStatus } from '../models/GameStatus';
import { canConfirmFleet } from '../rules/gameLifecycleRules';

export type ConfirmFleetParams = {
    game: GameState;
};

export function confirmFleet({
    game,
}: ConfirmFleetParams): GameState {
    if (!canConfirmFleet(game)) {
        throw new Error('Cannot execute confirmFleet from current lifecycle state.');
    }

    return {
        ...game,
        phase: GamePhase.BATTLE,
        status: GameStatus.PLAYER_TURN,
    };
}