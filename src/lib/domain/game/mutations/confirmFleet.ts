import { GamePhase } from '../models/GamePhase';
import { GameState } from '../models/GameState';
import { GameStatus } from '../models/GameStatus';

export type ConfirmFleetParams = {
    game: GameState;
};

export function confirmFleet({
    game,
}: ConfirmFleetParams): GameState {
    return {
        ...game,
        phase: GamePhase.BATTLE,
        status: GameStatus.PLAYER_TURN,
    };
}