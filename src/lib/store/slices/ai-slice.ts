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
/**
 * AI Slice Implementation
 */
export const createAISlice: StateCreator<
    CompleteGameStore,
    GameStoreMiddlewares,
    [],
    AISlice
> = (set, get) => ({
    /**
     * Initialize AI with randomly placed ships
     */
    _initializeAI: () => {
        console.log("[AI] 🤖 Initializing AI...");

        const state = get();
        const aiShips = generateAIShips(state.config.boardSize);

        if (!aiShips || aiShips.length === 0) {
            console.error("[AI] ❌ Failed to generate AI ships");
            return;
        }

        set(
            (draft) => {
                draft.ai.ships = aiShips;
                draft.ai.boardState = createBoardState(aiShips, []);
                draft.ai.isReady = true;

                console.log("[AI] ✅ AI initialized:", {
                    shipCount: aiShips.length,
                    isReady: draft.ai.isReady,
                });
            },
            false,
            "ai/_initializeAI"
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
                draft.ai.boardState = createBoardState([], []);

                draft.ai.isReady = false;

                if (draft.ai.memory) {
                    draft.ai.memory.lastAttacks = [];
                }
            },
            false,
            "ai/resetAI"
        );
    },
    /**
     * Debug method: regenerates AI ships only (no full reset needed)
     */

    debugRegenerateAI: () => {
        if (process.env.NODE_ENV !== 'development') {
            console.warn("[AI] ⚠️ debugRegenerateAI only available in development");
            return;
        }

        console.log("[AI] 🧪 Debug: Regenerating AI ships...");
        
        // Reset AI first, then initialize
        get().resetAI();
        
        // Wait a tick for state to settle
        setTimeout(() => {
            get()._initializeAI();
        }, 50);
    }
});
