import { GameState } from '@/lib/domain/game/models/GameState';
import { ShipPlacement } from '../../domain/placement/models/ShipPlacement';

// export type GameplayState = {
//     phase: GamePhase;
//     status: GameStatus;

//     playerPlacements: ShipPlacement[];
//     enemyPlacements: ShipPlacement[];
// };
export type GameplayState =
    GameState & {
        playerPlacements: ShipPlacement[];
        enemyPlacements: ShipPlacement[];
    };