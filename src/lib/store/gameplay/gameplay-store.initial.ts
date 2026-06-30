import type { GameplayState } from './gameplay-store.types';
import { initialGameState } from '../../domain/game/models/initialGameState';

export const initialGameplayState: GameplayState = {
    game: initialGameState,

    playerPlacements: [],
    enemyPlacements: [],
};