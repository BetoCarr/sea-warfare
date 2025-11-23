import type { StateCreator } from "zustand";
import type { Ship } from "@/lib/utils/types";
import { GamePhase, GameStatus } from "../game-types";
import  { placeShip, removeShipFromBoard } from "../../game-logic/ships/ship-placement"
import { createBoardState } from "@/lib/game-logic/board/board-sync";
import type { CompleteGameStore, GameStoreMiddlewares } from "../store-types";

export interface PlacementSlice {
    placePlayerShip: (ship: Ship) => {
        success: boolean;
        message: string;
        error?: string;
        data?: any;
    };

    removePlayerShip: (shipId: string) => {
        success: boolean;
        message: string;
        error?: string;
        data?: any;
    };

    confirmPlacement: () => {
        success: boolean;
        message: string;
        error?: string;
        data?: any;
    };
}

/**
 * Slice: PlacementSlice
 * ----------------------------------------------------------
 * Handles placement of the player's ships during the PLACEMENT
 * phase. All logic related to adding, updating, removing ships,
 * and validating a complete setup lives here.
 *
 * Responsibilities:
 * - Validates phase and player state before placement actions
 * - Prevents duplicate ship placements
 * - Uses the core helpers (placeShip, createBoardState)
 * - Updates player.isReady when all ships are placed
 * - Executes the transition toward BATTLE once AI is ready
 *
 * This slice does NOT handle:
 * - Lifecycle or resets
 * - AI auto-placement
 * - Battle mechanics (attacks, hit/miss, sinking)
 * - Turn handling
 */
export const createPlacementSlice: StateCreator<
    CompleteGameStore,
    GameStoreMiddlewares,
    [],
    PlacementSlice
> = (set, get) => ({

    /**
     * Places a player ship on the board during the PLACEMENT phase.
     * - Validates the game phase
     * - Ensures no duplicate ship is placed
     * - Uses placeShip() helper for placement rules & collision checking
     * - Updates ships and board state
     */
    placePlayerShip: (ship) => {
        const state = get();

        // --- Validate phase ---
        if (state.phase !== GamePhase.PLACEMENT) {
            return {
                success: false,
                message: "You can only place ships during the placement phase.",
                error: "INVALID_PHASE",
            };
        }

        // --- Validate player ---
        if (!state.player) {
            return {
                success: false,
                message: "Player not initialized.",
                error: "NO_PLAYER",
            };
        }

        const player = state.player;

        // --- Validate duplicate ship ---
        const alreadyPlaced = player.ships.some((s) => s.id === ship.id);
        if (alreadyPlaced) {
            return {
                success: false,
                message: `${ship.type} already placed.`,
                error: "DUPLICATE_SHIP",
            };
        }

        try {
            // --- Attempt placement using core logic ---
            const placedShip = placeShip(
                ship,
                ship.position!,
                ship.orientation!,
                state.config.boardSize,
                player.ships
            );

            // --- Update state ---
            set(
                (draft) => {
                    draft.player.ships.push(placedShip);
                    draft.player.boardState = createBoardState(
                        draft.player.ships,
                        []
                    );

                    // Automatically mark player ready when all ships are placed
                    if (draft.player.ships.length >= 5) {
                        draft.player.isReady = true;
                        console.log("[Placement] Player is ready (all ships placed)");
                    }

                    console.log(
                        `[Placement] Ship placed: ${placedShip.type} at (${placedShip.position?.row}, ${placedShip.position?.col}) [${placedShip.orientation}]`
                    );
                },
                false,
                "placement/placePlayerShip"
            );

            return {
                success: true,
                message: `${placedShip.type} placed successfully.`,
                data: { ship: placedShip },
            };
        } catch (error: any) {
            console.warn("[Placement] Error placing ship:", error.message);
            return {
                success: false,
                message: error.message || "Invalid ship placement.",
                error: "INVALID_PLACEMENT",
            };
        }
    },

    /**
     * Removes a previously placed ship from the board.
     * - Valid during PLACEMENT phase only
     * - Updates board and readiness
     */
    removePlayerShip: (shipId) => {
        const state = get();

        // --- Validate phase ---
        if (state.phase !== GamePhase.PLACEMENT) {
            return {
                success: false,
                message: "You can only remove ships during the placement phase.",
                error: "INVALID_PHASE",
            };
        }

        if (!state.player) {
            return {
                success: false,
                message: "Player not initialized.",
                error: "NO_PLAYER",
            };
        }

        const player = state.player;
        const targetShip = player.ships.find((s) => s.id === shipId);

        if (!targetShip) {
            console.warn("[Placement] Ship not found:", shipId);
            return {
                success: false,
                message: "Ship not found on board.",
                error: "SHIP_NOT_FOUND",
            };
        }

        const clearedShip = removeShipFromBoard(targetShip);

        // --- Update state ---
        set(
            (draft) => {
                draft.player.ships = draft.player.ships.filter(
                    (s) => s.id !== shipId
                );

                draft.player.boardState = createBoardState(
                    draft.player.ships,
                    []
                );

                // Player no longer ready if fewer than 5 ships remain
                draft.player.isReady = draft.player.ships.length >= 5;

                console.log("[Placement] Ship removed:", {
                    removedShip: clearedShip.type,
                    remainingShips: draft.player.ships.length,
                    isReady: draft.player.isReady,
                });
            },
            false,
            "placement/removePlayerShip"
        );

        return {
            success: true,
            message: `Ship ${targetShip.type} removed successfully.`,
            data: { shipId },
        };
    },

    /**
     * Confirms that the player has placed all ships.
     * - Validates ship count, structure, and orientation
     * - Marks player as ready
     * - If AI is ready, transitions to BATTLE
     */
    confirmPlacement: () => {
        const state = get();

        // --- Validate phase ---
        if (state.phase !== GamePhase.PLACEMENT) {
            return {
                success: false,
                message: "You can only confirm placement during the placement phase.",
                error: "INVALID_PHASE",
            };
        }

        if (!state.player) {
            return {
                success: false,
                message: "Player not initialized.",
                error: "NO_PLAYER",
            };
        }

        const player = state.player;

        // --- Validate ship count ---
        if (player.ships.length < 5) {
            return {
                success: false,
                message: "You must place all ships before confirming.",
                error: "INCOMPLETE_PLACEMENT",
            };
        }

        // --- Validate ship completeness ---
        const invalidShips = player.ships.filter(
            (s) => !s.position || !s.orientation
        );

        if (invalidShips.length > 0) {
            return {
                success: false,
                message:
                    "Some ships are missing a position or orientation.",
                error: "INVALID_SHIP_DATA",
            };
        }

        // --- Update state ---
        set(
            (draft) => {
                draft.player.isReady = true;
                draft.player.boardState = createBoardState(
                    draft.player.ships,
                    []
                );

                console.log("[Placement] Player confirmed placement.");

                // --- Start battle immediately if AI is ready ---
                if (draft.ai.isReady) {
                    draft.phase = GamePhase.BATTLE;
                    draft.status = GameStatus.WAITING_FOR_PLAYER;
                    draft.currentTurn = "player";
                    draft.turnNumber = 1;
                    draft.startTime = new Date();

                    console.log("[Placement] Battle phase started!");
                }
            },
            false,
            "placement/confirmPlacement"
        );

        return {
            success: true,
            message: state.ai.isReady
                ? "Placement confirmed — battle begins!"
                : "Placement confirmed — waiting for AI...",
            data: {
                playerReady: true,
                aiReady: state.ai.isReady,
                phase: state.ai.isReady ? GamePhase.BATTLE : GamePhase.PLACEMENT,
            },
        };
    },
});
