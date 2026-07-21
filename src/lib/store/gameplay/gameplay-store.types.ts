import { ShipPlacement } from '../../domain/placement/models/ShipPlacement';

import { GameState } from '@/lib/domain/game/models/GameState';

export type GameplayState = {
    game: GameState;

    playerPlacements: ShipPlacement[];
    enemyPlacements: ShipPlacement[];
};