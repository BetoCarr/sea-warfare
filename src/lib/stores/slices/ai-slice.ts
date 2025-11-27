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

        set((draft) => {
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
});
