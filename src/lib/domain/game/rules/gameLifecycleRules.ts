import { GamePhase } from '../models/GamePhase';
import { GameStatus } from '../models/GameStatus';
import type { GameState } from '../models/GameState';

export function canInitializeGame(game: GameState): boolean {
    return game.phase === GamePhase.SETUP && game.status === GameStatus.IDLE;
}

export function canConfirmFleet(game: GameState): boolean {
    return game.phase === GamePhase.PLACEMENT && game.status === GameStatus.FLEET_READY;
}
