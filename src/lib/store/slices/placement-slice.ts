import type { StateCreator } from "zustand";
import type { ShipPlacementInfo, Ship, Orientation, Position, ShipType } from "@/lib/utils/types";
import type { PlacementIntent, PlacementPreview } from "@/lib/game-logic/placement/placement-types";
import { GamePhase } from "../game-types";
import  { canPlaceShipAt, intentToPlaceable, removeShipFromBoard } from "../../game-logic/ships/ship-placement"
import { getBaseShipByType } from "../../game-logic/ships/ship-catalog";
import { createBoardState } from "@/lib/game-logic/board/board-sync";
import type { CompleteGameStore, GameStoreMiddlewares } from "../store-types";
import type { GameActionResult } from "../game-types";
import { createShipFromPlacement } from "@/lib/game-logic/ships/ship-entity";
import { getOccupiedCells } from "@/lib/game-logic/ships/ship-cell-info";
import { shipToPlaceable, toPlacementIntent } from "@/lib/game-logic/placement/placement-adapters";

// --- Result Types ---
export interface PlaceShipResult {
    ship: Ship;
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
    selectedShipType: ShipType | null;
    orientation: Orientation;
    preview: PlacementPreview | null;

    // Actions
    selectShip: (shipType: ShipType | null) => void;
    toggleOrientation: () => void;
    previewPlacement: (position: Position) => void;
    confirmShipPlacement: () => GameActionResult<PlaceShipResult>;
    removePlayerShip: (shipId: string) => GameActionResult<RemoveShipResult>;
    confirmFleetPlacement: () => GameActionResult<ConfirmPlacementResult>;
}

export const createPlacementSlice: StateCreator<
    CompleteGameStore,
    GameStoreMiddlewares,
    [],
    PlacementSlice
> = (set, get) => ({

    // Initial State
    selectedShipType: null,
    orientation: "horizontal",
    preview: null,

    // Actions
    selectShip: (shipType) => {
        set((state) => {
            state.selectedShipType = shipType;
            console.log("[Placement] Ship selected:", shipType);
        }, false, "placement/selectShip");
    },

    toggleOrientation: () => {
        set((state) => {
            state.orientation = state.orientation === "horizontal" ? "vertical" : "horizontal";
        }, false, "placement/toggleOrientation");
    },

    // PREVIEWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW
    previewPlacement: (position) => {
        const { selectedShipType, orientation, player, config } = get();

        if (!selectedShipType) {
            set({ preview: null });
            return;
        }

        const baseShip = getBaseShipByType(selectedShipType);

        if (!baseShip) {
            set({ preview: null });
            return;
        }

        const intent: PlacementIntent = {
            ship: baseShip,
            position,
            orientation
        };

        const existingPlaceables = player.ships
            .filter(s => s.position) // seguridad
            .map(toPlacementIntent);

        const isValid = canPlaceShipAt(
            intent,
            config.boardSize,
            existingPlaceables
        );
        
        // const occupiedCells = getOccupiedCells(
        //     baseShip.size,
        //     position,
        //     orientation
        // );

        const placeable = intentToPlaceable(intent);
        const occupiedCells = getOccupiedCells(placeable);
        console.log(occupiedCells)

        set({
            preview: {
                intent,
                occupiedCells,
                result: isValid ? 'valid' : 'invalid',
            }
        });
    },

    confirmShipPlacement: () => {
        const state = get();

        if (state.phase !== GamePhase.PLACEMENT) {
            return {
                success: false,
                error: "INVALID_PHASE"
            };
        }

        if (!state.preview) {
            return {
                success: false,
                error: "NO_PREVIEW"
            };
        }

        const placement = state.preview;

        const ship = createShipFromPlacement(placement.intent);

        set((draft) => {

            draft.player.ships.push(ship);

            draft.preview = null;
            draft.selectedShipType = null;

        }, false, "placement/confirmShipPlacement");

        return {
            success: true,
            message: "Ship placed successfully.",
            data: {
                ship
            }
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
                    // removedShip: clearedShip.type,
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
    confirmFleetPlacement: () => {
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
