import { GamePhase } from './GamePhase';



import type { GameState } from './GameState';

export const initialGameState: GameState = {
    phase: GamePhase.SETUP,
};