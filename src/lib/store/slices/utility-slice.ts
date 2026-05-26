import type { StateCreator } from 'zustand';
import { GamePhase, GameStatus } from '../../domain/game/game-types';
import type { CompleteGameStore, GameStoreMiddlewares } from '../store-types';
/**
 * Slice: UtilitySlice
 * ----------------------------------------------------------
 * Provides general-purpose actions for updating fundamental
 * game properties that are shared across multiple slices.
 * 
 * These setters are intentionally minimal and should be used
 * when a direct update to a core field (phase or status) is
 * required without additional logic or validation.
 */
export interface UtilitySlice {
    setPhase: (phase: GamePhase) => void;
    setStatus: (status: GameStatus) => void;
}

/**
 * Utility slice implementation
 * ----------------------------------------------------------
 * Basic setters for high-level game properties.
 */
export const createUtilitySlice: StateCreator<
    CompleteGameStore,
    GameStoreMiddlewares,
    [],
    UtilitySlice
> = (set) => ({
    /**
     * Updates the current game phase.
     * Typically used to move between setup, placement, battle,
     * and game-over stages.
     */
    setPhase: (phase) => {
        console.log(`[Utility] 🔄 setPhase → ${phase}`);
        set(
            (draft) => {
                draft.phase = phase;
            },
            false,
            'utility/setPhase'
        );
    },
    /**
     * Updates the current game status.
     * Represents finer-grained progress indicators that
     * complement the active game phase.
     */
    setStatus: (status) => {
        console.log(`[Utility] 🔄 setStatus → ${status}`);
        set(
            (draft) => {
                draft.status = status;
            },
            false,
            'utility/setStatus'
        );
    },
});
