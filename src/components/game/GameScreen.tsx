"use client";

import Board from "./Board";
import { GameHUD } from "../hud/GameHUD";
import { useShallow } from "zustand/react/shallow";
import { useGameStore } from "@/lib/store/game-store";
import { GamePhase } from "@/lib/store/game-types";
import type { Ship, ShipType } from "@/lib/utils/types";
import { SHIPS_CONFIG } from "@/lib/utils/constants";

export function GameScreen() {
    const {
        player,
        ai,
        phase,
        currentTurn,
        playerAttack,
        placePlayerShip,
        removePlayerShip,
        selectShip,
        initializeGame,
        selectedShipId,
        orientation
    } = useGameStore(
        useShallow((state) => ({
            player: state.player,
            ai: state.ai,
            phase: state.phase,
            currentTurn: state.currentTurn,
            playerAttack: state.playerAttack,
            placePlayerShip: state.placePlayerShip,
            removePlayerShip: state.removePlayerShip,
            selectShip: state.selectShip,
            initializeGame: state.initializeGame,
            selectedShipId: state.selectedShipId,
            orientation: state.orientation,
        }))
    );

    const playerBoard = player.boardState.board; // CellState[][]
    const aiBoard = ai.boardState.board;

    // Handle game initialization if in setup phase
    const handleInitialize = () => {
        initializeGame({ boardSize: 10 });
    };

    // Callback para click en el tablero del jugador
    const handlePlayerCellClick = (row: number, col: number) => {
        if (phase === GamePhase.PLACEMENT) {
            
            // Check if there is already a ship at this cell to remove it
            // Logic: loop through placed ships and see if coordinates match
            const shipAtCell = player.ships.find(ship => {
                if (!ship.position) return false;
                const { row: sRow, col: sCol } = ship.position;
                if (ship.orientation === 'horizontal') {
                    return row === sRow && col >= sCol && col < sCol + ship.size;
                } else {
                    return col === sCol && row >= sRow && row < sRow + ship.size;
                }
            });

            if (shipAtCell) {
                // If clicked a placed ship, remove it (Pick up)
                removePlayerShip(shipAtCell.id);
                selectShip(shipAtCell.id); // Select it so user can place it again immediately
                return;
            }

            // Normal Placement Logic
            if (!selectedShipId) {
                console.warn("No ship selected");
                return;
            }

            // Extract ship type from ID (e.g., "carrier-1" -> "carrier")
            const type = selectedShipId.split('-')[0] as ShipType;
            const config = SHIPS_CONFIG[type];

            if (!config) {
                console.error("Invalid ship type config:", type);
                return;
            }

            const newShip: Ship = {
                id: selectedShipId,
                type: type,
                size: config.size,
                position: { row, col },
                orientation: orientation,
                hits: [], // will be initialized by state creator or logic if needed, but safe to init empty or pre-filled
                isSunk: false
            };

            const result = placePlayerShip(newShip);
            if (!result.success) {
                console.warn("Placement failed:", result.message);
                // TODO: Show toast feedback
            }

        } else if (phase === GamePhase.BATTLE && currentTurn === "player") {
            // Self-board interaction during battle? usually not, unless repairing or ability
            console.log("Player clicked self board in battle");
        }
    };

    // Handler for Drag and Drop placement
    const handleDragOver = (row: number, col: number, e: React.DragEvent) => {
        if (phase === GamePhase.PLACEMENT) {
            e.preventDefault(); // Allows the drop
        }
    };

    const handleDrop = (row: number, col: number, e: React.DragEvent) => {
        if (phase !== GamePhase.PLACEMENT) return;
        e.preventDefault();

        const dataStr = e.dataTransfer.getData("application/json");
        if (!dataStr) return;

        try {
            const data = JSON.parse(dataStr) as { id: string; type: ShipType; size: number };
            const { id, type, size } = data;

            // Construct Ship object
            const newShip: Ship = {
                id, // Use the ID from the palette (e.g. carrier-1)
                type,
                size,
                position: { row, col },
                orientation: orientation,
                hits: [],
                isSunk: false
            };
            
            // Attempt to place
            const result = placePlayerShip(newShip);
            if (!result.success) {
                console.warn("Drag placement failed:", result.message);
                // TODO: Show toast
            }
        } catch (err) {
            console.error("Failed to parse drag data", err);
        }
    };

    return (
        <main className="min-h-screen w-full bg-slate-900 text-white flex justify-center py-8 px-4">
            <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-[1fr_0.6fr_1fr] gap-6">
                {/* Player Board */}
                <section className="bg-slate-800 rounded-xl p-2 shadow-lg flex flex-col items-center pr-4">
                    <h2 className="text-center mb-3 text-lg font-semibold text-sky-300">
                        Your Fleet
                    </h2>
                    <Board
                        size={10}
                        cells={playerBoard}
                        isPlayerBoard={true}
                        onCellClick={handlePlayerCellClick}
                        onCellDrop={handleDrop}
                        onCellDragOver={handleDragOver}
                        ships={player.ships}
                        forceShowShips={true}
                        disabled={phase === GamePhase.GAME_OVER}
                    />
                </section>

                {/* Sidebar */}
                <section className="bg-slate-800 rounded-xl p-2 shadow-lg flex flex-col gap-4 items-center">
                    <GameHUD onInitialize={handleInitialize} />
                </section>

                {/* AI Board */}
                <section className="bg-slate-800 rounded-xl p-2 shadow-lg flex flex-col items-center">
                    <h2 className="text-center mb-3 text-lg font-semibold text-red-300">
                        Enemy Waters
                    </h2>
                    {/* AIBoard */}
                </section>
            </div>
        </main>
    );
}
