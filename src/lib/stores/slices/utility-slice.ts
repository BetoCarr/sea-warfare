import type { StateCreator } from 'zustand';
import { GameState, GamePhase, GameStatus } from '../game-types';
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
    GameState & UtilitySlice,  // ← CAMBIO: Tipo completo del store
    [["zustand/immer", never], ["zustand/devtools", never]],  // ← CAMBIO: Middlewares
    [],
    UtilitySlice
> = (set) => ({
    /**
     * Updates the current game phase.
     * Typically used to move between setup, placement, battle,
     * and game-over stages.
     */
    setPhase: (phase) => {
        console.log(`[GameStore] 🔄 setPhase → ${phase}`);
        set((state) => {
            (state as any).phase = phase;
        });
    },
    /**
     * Updates the current game status.
     * Represents finer-grained progress indicators that
     * complement the active game phase.
     */
    setStatus: (status) => {
        console.log(`[GameStore] 🔄 setStatus → ${status}`);
        set((state) => {
            (state as any).status = status;
        });
    },
});
