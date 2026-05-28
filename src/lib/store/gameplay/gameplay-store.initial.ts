import type { GameplayState } from './gameplay-store.types';
import { GamePhase, GameStatus } from '../../domain/game/game-types';

export const initialGameplayState: GameplayState = {
    phase: GamePhase.SETUP,
    status: GameStatus.IDLE,

    playerPlacements: [],
    enemyPlacements: [],
};
