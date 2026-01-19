import type { StateCreator } from "zustand";
import type { Ship } from "@/lib/utils/types";
import { GamePhase } from "../game-types";
import  { placeShip, removeShipFromBoard } from "../../game-logic/ships/ship-placement"
import { createBoardState } from "@/lib/game-logic/board/board-sync";
import type { CompleteGameStore, GameStoreMiddlewares } from "../store-types";
import type { GameActionResult } from "../game-types";

// --- Result Types ---
export interface PlaceShipResult {
    ship: Ship;
    dryRun?: boolean;
}

export interface RemoveShipResult {
    shipId: string;
}

export interface ConfirmPlacementResult {
    playerReady: boolean;
    aiReady: boolean;
    phase: GamePhase;
}

// --- Slice Interface ---
export interface PlacementSlice {
    // State
    selectedShipId: string | null;
    // orientation: ship;
    orientation: "horizontal" | "vertical";
    
    // Actions
    selectShip: (shipId: string | null) => void;
    toggleOrientation: () => void;
    placePlayerShip: (ship: Ship, options?: { dryRun?: boolean }) => GameActionResult<PlaceShipResult>;
    removePlayerShip: (shipId: string) => GameActionResult<RemoveShipResult>;
    confirmPlacement: () => GameActionResult<ConfirmPlacementResult>;
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
    // Initial State
    selectedShipId: null,
    orientation: "horizontal",

    // Actions
    selectShip: (shipId) => {
        set((state) => {
            state.selectedShipId = shipId;
        }, false, "placement/selectShip");
    },

    toggleOrientation: () => {
        set((state) => {
            state.orientation = state.orientation === "horizontal" ? "vertical" : "horizontal";
        }, false, "placement/toggleOrientation");
    },


    /**
     * Places a player ship on the board during the PLACEMENT phase.
     * - Validates the game phase
     * - Ensures no duplicate ship is placed
     * - Uses placeShip() helper for placement rules & collision checking
     * - Updates ships and board state
     */
    placePlayerShip: (
        ship,
        options?: { dryRun?: boolean }
    ) => {    
        const { dryRun = false } = options ?? {};
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

            // 🚨 NUEVO: si es dryRun, terminamos aquí
            if (dryRun) {
                return {
                    success: true,
                    message: "Valid placement.",
                    data: { ship: placedShip },
                };
            }
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
        } catch (error: unknown) {
            const message = error instanceof Error 
                ? error.message 
                : "Invalid ship placement.";

            console.warn("[Placement] Error placing ship:", message);

            return {
                success: false,
                message,
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
        if (!state.ai.isReady) {
            return {
                success: false,
                message: "AI is not ready yet",
                error: "AI_NOT_READY",
            }
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
                message: "Some ships are missing a position or orientation.",
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
            },
            false,
            "placement/confirmPlacement"
        );

        // Try to start game (Lifecycle check will handle final validation)
        const startGameResult = get().startGame();

        return {
            success: true,
            message: startGameResult.success 
                ? "Battle begins!" 
                : "Placement confirmed — waiting for opponent...",
            data: {
                playerReady: true,
                aiReady: state.ai.isReady,
                phase: startGameResult.success ? GamePhase.BATTLE : GamePhase.PLACEMENT,
            },
        };
    },
});
