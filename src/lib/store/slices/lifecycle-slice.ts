import { StateCreator } from "zustand";
import type { GameConfig, GameActionResult } from "../game-types";
import { GamePhase, GameStatus } from "../game-types";
import { createInitialGameState } from "../utils/initial-state";
import { getStartGameBlockerMessage } from "../game-selectors";
import type { CompleteGameStore, GameStoreMiddlewares } from "../store-types";

/**
 * Slice: LifecycleSlice
 * ----------------------------------------------------------
 * Handles the overall lifecycle of the game:
 *  - initializeGame: creates a fresh state with given config
 *  - startGame: validates readiness and begins the battle
 *  - resetGame: resets to an initial clean state
 */
export interface LifecycleSlice {
    initializeGame: (config?: Partial<GameConfig>) => void;
    startGame: () => GameActionResult;
    resetGame: () => void;
}

/**
 * Lifecycle slice implementation
 * ----------------------------------------------------------
 * Includes reference to `_initializeAI` from helper slice.
 */
export const createLifecycleSlice: StateCreator<
    CompleteGameStore, 
    GameStoreMiddlewares,
    [],
    LifecycleSlice
> = (set, get) => ({
    /**
     * Initializes the game state using the provided configuration.
     * Resets all relevant fields, generates new player/AI states,
     * and transitions to the placement phase.
     */
    initializeGame: (config) => {
        console.log("[Lifecycle] 🎮 initializeGame called with config:", config);

        set(
            (draft) => {
                // Build a new base state with optional overrides
                const newState = createInitialGameState(config);
                
                // Replace entire draft with new initial structure
                Object.assign(draft, newState);

                // Transition to placement phase (player places ships)
                draft.phase = GamePhase.PLACEMENT;
                draft.status = GameStatus.PLACING_SHIPS;

                console.log("[Lifecycle] ✅ Game state initialized:", {
                    gameId: draft.gameId,
                    phase: draft.phase,
                    status: draft.status,
                    config: draft.config,
                });
            },
            false,
            "lifecycle/initializeGame"
        );

        // Schedule delayed AI initialization to ensure store stability
        setTimeout(() => {
            console.log("[Lifecycle] 🤖 Scheduling AI initialization");
            get()._initializeAI();
        }, 100);
    },
    /**
     * Starts the battle phase after verifying that the setup
     * conditions are satisfied. Returns a standardized result.
     */
    startGame: () => {
        console.log("[Lifecycle] 🚀 startGame called");

        const state = get();
        const blocker = getStartGameBlockerMessage(state);

        // Prevent game start if there are setup blockers
        if (blocker) {
            console.warn("[Lifecycle] ⚠️ Cannot start game:", blocker);
            return { success: false, message: blocker };
        }

        // Advance to battle phase and waiting state
        set(
            (draft) => {
                draft.phase = GamePhase.BATTLE;
                draft.status = GameStatus.WAITING_FOR_PLAYER;
            },
            false,
            "lifecycle/startGame"
        );

        console.log("[Lifecycle] ✅ Game started successfully");
        return { success: true, message: "Game started" };
    },
    /**
     * Restores the store to a clean state, effectively restarting
     * the game flow and resetting all runtime data.
     */
    resetGame: () => {
        console.log("[Lifecycle] 🔄 resetGame called");
        set(
            (draft) => {
                // Rebuild base game state with default configuration
                const newState = createInitialGameState();
                Object.assign(draft, newState);
                
                // Set back to setup phase and idle status
                draft.phase = GamePhase.SETUP;
                draft.status = GameStatus.IDLE;
            },
            false,
            "lifecycle/resetGame"
        );
        console.log("[Lifecycle] ✅ Game reset complete");
    },
});
