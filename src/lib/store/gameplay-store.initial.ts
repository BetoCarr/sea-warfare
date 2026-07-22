import { initialGameState } from '../domain/game/models/initialGameState';



import type { GameplayState } from './gameplay-store.types';

export const initialGameplayState: GameplayState = {
    game: initialGameState,

    playerPlacements: [],
    enemyPlacements: [],
};