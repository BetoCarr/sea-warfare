import type { StateCreator } from "zustand";
import { GameStatus } from "../game-types";
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
        console.log("[GameStore] 🔄 _transitionToNextTurn called");

        const state = get();
        const nextTurn = state.currentTurn === "player" ? "ai" : "player";

        set(draft => {
        draft.currentTurn = nextTurn;
        draft.status =
            nextTurn === "player"
                ? GameStatus.WAITING_FOR_PLAYER
                : GameStatus.AI_THINKING;

            console.log("[GameStore] ✅ Turn transitioned:", {
                from: state.currentTurn,
                to: nextTurn,
                status: draft.status
            });
        });

        if (nextTurn === "ai") {
            setTimeout(() => {
                console.log("[GameStore] 🎯 Triggering AI attack");
                get().aiAttack();
            }, 1000);
        }
    }
});
