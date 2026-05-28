import { GamePhase, GameStatus } from '../../domain/game/game-types';
import { ShipPlacement } from '../../domain/placement/models/ShipPlacement';

export type GameplayState = {
    phase: GamePhase;
    status: GameStatus;

    playerPlacements: ShipPlacement[];
    enemyPlacements: ShipPlacement[];
};