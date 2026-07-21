import { GamePhase } from '../models/GamePhase';

import { GameState } from '../models/GameState';

export type InitializeGameParams = {
    game: GameState;
};

export function initializeGame({
    game,
}: InitializeGameParams): GameState {
    return {
        ...game,
        phase: GamePhase.PLACEMENT,
    };
}