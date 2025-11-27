import type { StateCreator } from "zustand";
import { generateAIShips } from "@/lib/game-logic/ai/ai-ship-generator";
import { createBoardState } from "@/lib/game-logic/board/board-sync";
import type { CompleteGameStore, GameStoreMiddlewares } from "../store-types";

/**
 * Slice: AISlice
 * ----------------------------------------------------------
 * Responsible for all AI initialization and state preparation.
 * This slice assigns random ships to the AI and prepares its
 * board for the battle phase.
 */
export interface AISlice {
    /**
     * INTERNAL: Initializes AI with randomly placed ships
     * Called automatically by initializeGame() from lifecycle
     */
    _initializeAI: () => void;

    /**
     * Resets AI state (used on resetGame or debug)
     */
    resetAI: () => void;

    /**
     * Debug helper to regenerate AI ships without resetting the game
     */
    debugRegenerateAI: () => void;
}

export const createAISlice: StateCreator<
    CompleteGameStore,
    GameStoreMiddlewares,
    [],
    AISlice
> = (set, get) => ({
    _initializeAI: () => {
        console.log("[AI] 🤖 Initializing AI...");

        const state = get();
        const aiShips = generateAIShips(state.config.boardSize);

        set(
            (draft) => {
                draft.ai.ships = aiShips;
                draft.ai.boardState = createBoardState(aiShips, []);
                draft.ai.isReady = aiShips.length > 0;

                console.log("[AI] ✅ AI initialized:", {
                    shipCount: aiShips.length,
                    isReady: draft.ai.isReady,
                });
            },
            false,
            "ai/initializeAI"
        );
    },
    /**
     * Resets AI completely (used by resetGame or debug)
     */
    resetAI: () => {
        console.log("[AI] 🔄 Resetting AI...");

        set(
            (draft) => {
                draft.ai.ships = [];
                draft.ai.boardState = null as any;
                draft.ai.isReady = false;

                draft.ai.memory = {
                    lastAttacks: [],
                };
            },
            false,
            "ai/resetAI"
        );
    },
    /**
     * Debug method: regenerates AI ships only (no full reset needed)
     */
    debugRegenerateAI: () => {
        console.log("[AI] 🧪 Debug regenerating AI...")
        get()._initializeAI()
    }
});
