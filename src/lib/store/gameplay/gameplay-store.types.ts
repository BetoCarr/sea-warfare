import { GameState } from '@/lib/domain/game/models/GameState';
import { ShipPlacement } from '../../domain/placement/models/ShipPlacement';

export type GameplayState = {
    game: GameState;

    playerPlacements: ShipPlacement[];
    enemyPlacements: ShipPlacement[];
};