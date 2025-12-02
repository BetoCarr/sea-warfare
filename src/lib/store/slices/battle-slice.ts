import type { StateCreator } from "zustand";
import { GamePhase, GameStatus } from "../game-types";
import { processAttack } from "../../game-logic/board/board-attacks";
import { chooseAIAttackPosition } from "../../game-logic/ai/ai-attack";
import type { CompleteGameStore, GameStoreMiddlewares } from "../store-types";
import type { Position } from "@/lib/utils/types";
import type { GameActionResult } from "../game-types";
import type { AttackResult } from "../../game-logic/board/board-attacks";

export interface BattleSlice {
    playerAttack: (position: Position) => Promise<GameActionResult<AttackResult>>;
    aiAttack: () => Promise<GameActionResult<AttackResult>>;
}

/**
 * Slice: BattleSlice
 * ----------------------------------------------------------
 * Handles all logic related to the BATTLE phase:
 * - Player attacks
 * - AI attacks
 * - Turn transitions
 * - Game over detection
 */
export const createBattleSlice: StateCreator<
    CompleteGameStore,
    GameStoreMiddlewares,
    [],
    BattleSlice
> = (set, get) => ({

    /**
     * Executes player attack on AI's board
     */
    playerAttack: async (position) => {
        const state = get();

        console.log("[Battle] Player attacking:", position);

        // --- Validate phase ---
        if (state.phase !== GamePhase.BATTLE) {
            return {
                success: false,
                message: "You can only attack during the battle phase.",
                error: "INVALID_PHASE"
            };
        }

        // --- Validate turn ---
        if (state.currentTurn !== "player") {
            return {
                success: false,
                message: "It's not the player's turn.",
                error: "INVALID_TURN"
            };
        }

        // --- Execute attack ---
        const result = processAttack(state.ai.boardState, position);

        const { boardState, attackResult, isGameOver, winner } = result;

        set((draft) => {
            draft.ai.boardState = boardState;
            draft.lastAttack = { by: "player", ...attackResult };

            if (attackResult.type !== "invalid") {
                draft.moveHistory.push({
                    turnNumber: draft.turnNumber++,
                    playerId: draft.player.id,
                    position,
                    result: attackResult.type,
                    timestamp: new Date(),
                    shipSunk:
                        attackResult.type === "sunk"
                            ? attackResult.impactedShip?.type
                            : undefined,
                });
            }

            // --- Update status ---
            switch (attackResult.type) {
                case "hit":
                    draft.status = GameStatus.RESOLVING_ATTACK;
                    break;
                case "sunk":
                    draft.status = GameStatus.SHIP_SUNK;
                    break;
                case "miss":
                    draft.status = GameStatus.AI_TURN;
                    break;
                default:
                    draft.status = GameStatus.IDLE;
            }

            // --- Game over ---
            if (isGameOver) {
                draft.status = GameStatus.FINISHED;
                draft.outcome = { winner: winner ?? "player" };
                draft.endTime = new Date();

                console.log("[Battle] ✅ Player wins");
            }
        }, false, "battle/playerAttack");
        
        if (attackResult.type !== "invalid" && !isGameOver) {
            get()._transitionToNextTurn();
        }

        return {
            success: attackResult.type !== "invalid",
            message: humanMessageFromAttack(attackResult.type),
            data: attackResult
        };
    },

    /**
     * Executes AI attack on player's board
     */
    aiAttack: async () => {
        const state = get();

        console.log("[Battle] AI attacking...");

        if (state.phase !== GamePhase.BATTLE) {
            return {
                success: false,
                message: "AI can only attack during BATTLE phase",
                error: "INVALID_PHASE"
            };
        }

        const position = chooseAIAttackPosition(
            state.player.boardState,
            state.config.boardSize
        );

        const result = processAttack(state.player.boardState, position);

        const { boardState, attackResult, isGameOver, winner } = result;

        set((draft) => {
            draft.player.boardState = boardState;
            draft.lastAttack = { by: "ai", ...attackResult };

            if (attackResult.type !== "invalid") {
                draft.moveHistory.push({
                    turnNumber: draft.turnNumber,
                    playerId: draft.ai.id,
                    position,
                    result: attackResult.type,
                    timestamp: new Date(),
                    shipSunk:
                        attackResult.type === "sunk"
                            ? attackResult.impactedShip?.type
                            : undefined,
                });
            }

            switch (attackResult.type) {
                case "hit":
                    draft.status = GameStatus.RESOLVING_ATTACK;
                    break;
                case "sunk":
                    draft.status = GameStatus.SHIP_SUNK;
                    break;
                case "miss":
                    draft.status = GameStatus.WAITING_FOR_PLAYER;
                    break;
                default:
                    draft.status = GameStatus.IDLE;
            }

            if (isGameOver) {
                draft.status = GameStatus.FINISHED;
                draft.outcome = { winner: winner ?? "ai" };
                draft.endTime = new Date();

                console.log("[Battle] ❌ AI wins");
            }

        }, false, "battle/aiAttack");

        if (attackResult.type !== "invalid" && !isGameOver) {
            get()._transitionToNextTurn();
        }

        return {
            success: attackResult.type !== "invalid",
            message: humanMessageFromAttack(attackResult.type),
            data: attackResult
        };
    },
});


/**
 * Converts attack type to a human-readable message
 */
function humanMessageFromAttack(type: string) {
    switch (type) {
        case "hit":
            return "Hit!";
        case "sunk":
            return "Ship sunk!";
        case "miss":
            return "Miss!";
        case "invalid":
            return "Invalid attack.";
        default:
            return "Attack processed.";
    }
}
