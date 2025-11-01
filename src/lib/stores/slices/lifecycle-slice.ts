import { StateCreator } from "zustand";
import type { GameState, GameConfig, GameActionResult } from "../game-types";
import { GamePhase, GameStatus } from "../game-types";
import { createInitialGameState } from "../utils/initial-state";
import { getStartGameBlockerMessage } from "../game-selectors";

/**
 * =========================================================
 * 🧠 Lifecycle Slice
 * ---------------------------------------------------------
 * Controla el ciclo de vida del juego:
 *  - initializeGame
 *  - startGame
 *  - resetGame
 * =========================================================
 */
export interface LifecycleSlice {
    initializeGame: (config?: Partial<GameConfig>) => void;
    startGame: () => GameActionResult;
    resetGame: () => void;
}

export const createLifecycleSlice: StateCreator<
    GameState & LifecycleSlice & { _initializeAI: () => void },
    [["zustand/immer", never], ["zustand/devtools", never]],
    [],
    LifecycleSlice
> = (set, get) => ({
    /**
     * Inicializa el juego con una configuración parcial o por defecto.
     */
    initializeGame: (config) => {
        console.log("[Lifecycle] 🎮 initializeGame called with config:", config);

        set(
            (draft) => {
                const newState = createInitialGameState(config);
                Object.assign(draft, newState);

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

        // Inicialización diferida de la IA
        setTimeout(() => {
            console.log("[Lifecycle] 🤖 Scheduling AI initialization");
            get()._initializeAI();
        }, 100);
    },
    /**
     * Inicia el juego (valida que todos estén listos).
     */
    startGame: () => {
        console.log("[Lifecycle] 🚀 startGame called");

        const state = get();
        const blocker = getStartGameBlockerMessage(state);

        if (blocker) {
            console.warn("[Lifecycle] ⚠️ Cannot start game:", blocker);
            return { success: false, message: blocker };
        }

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
     * Reinicia completamente el estado del juego.
     */
    resetGame: () => {
        console.log("[Lifecycle] 🔄 resetGame called");
        set(
            (draft) => {
                const newState = createInitialGameState();
                Object.assign(draft, newState);
                draft.phase = GamePhase.SETUP;
                draft.status = GameStatus.IDLE;
            },
            false,
            "lifecycle/resetGame"
        );
        console.log("[Lifecycle] ✅ Game reset complete");
    },
});
