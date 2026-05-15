import type { StateCreator } from "zustand";
import { GameStatus } from "@/lib/domain/game/game-types";
import type { CompleteGameStore } from "../store-types";

/**
 * Handles turn transitions between player and AI
 * This slice is responsible only for game turn flow logic
 */
export interface TurnSlice {
    /**
     * INTERNAL: Transitions to the next player's turn
     * Handles status updates and potential AI trigger
     */
    _transitionToNextTurn: () => void;
}

export const createTurnSlice: StateCreator<
    CompleteGameStore,
    [["zustand/immer", never]],
    [],
    TurnSlice
> = (set, get) => ({
    _transitionToNextTurn: () => {
        console.log("[TurnSlice] 🔄 Transitioning turn");

        const state = get();

        const nextTurn =
            state.currentTurn === "player"
                ? "ai"
                : "player";

        set((draft) => {
            draft.currentTurn = nextTurn;

            draft.status =
                nextTurn === "player"
                    ? GameStatus.PLAYER_TURN
                    : GameStatus.AI_TURN;
        });

        console.log("[TurnSlice] ✅ Turn updated:", {
            from: state.currentTurn,
            to: nextTurn,
        });

        /**
         * Trigger AI attack
         */
        if (nextTurn === "ai") {
            setTimeout(() => {
                console.log("[TurnSlice] 🤖 AI attacking");
                get().aiAttack();
            }, 600);
        }
    },
});
