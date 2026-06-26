// domain/game/models/initialGameState.ts
// DOCUMENTAR
import { GamePhase } from './GamePhase';
import { GameStatus } from './GameStatus';
import type { GameState } from './GameState';

export const initialGameState: GameState = {
    phase: GamePhase.SETUP,
    status: GameStatus.IDLE,
};