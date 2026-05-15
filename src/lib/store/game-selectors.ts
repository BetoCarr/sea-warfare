import type { GameState } from './game-types';
import { GamePhase } from '../domain/game/game-types';

/**
 * Determines whether the game can transition from PLACEMENT → BATTLE.
 * Returns true only if there are no validation blockers.
 */
export function canStartGame(state: GameState): boolean {
    return getStartGameBlockerMessage(state) === null;
}

/**
 * Returns a human-readable message explaining why the game 
 * cannot start yet, or `null` if all conditions are satisfied.
 *
 * This is the primary validation logic used by `startGame()` 
 * inside the Zustand store. Keeping it separate helps keep 
 * the store clean and improves testability.
 */
export function getStartGameBlockerMessage(state: GameState): string | null {
    if (state.phase !== GamePhase.PLACEMENT) return 'Game must be in placement phase';
    if (!state.player.isReady) return 'Place all your ships first';
    if (!state.ai.isReady) return 'Waiting for AI to initialize...';
    if (state.player.ships.length === 0) return 'You need to place ships first';
    if (state.ai.ships.length === 0) return 'AI has no ships (initialization error)';
    return null;
}
