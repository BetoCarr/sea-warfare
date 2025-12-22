"use client";

import Board from "./Board";
import { GameHUD } from "../hud/GameHUD";
import { useShallow } from "zustand/react/shallow";
import { useGameStore } from "@/lib/store/game-store";
import { GamePhase, GameStatus } from "@/lib/store/game-types";
import type { Ship, ShipType } from "@/lib/utils/types";
import { SHIPS_CONFIG } from "@/lib/utils/constants";
import { FeedbackMessage, FeedbackType } from "../hud/FeedbackMessage";
import { useState, useRef } from "react";

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
        orientation,
        status,
        lastAttack
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
            status: state.status,
            lastAttack: state.lastAttack,
        }))
    );

    const playerBoard = player.boardState.board; // CellState[][]
    const aiBoard = ai.boardState.board;

    // Local feedback state for placement errors (e.g. "Invalid Position")
    const [localFeedback, setLocalFeedback] = useState<{ msg: string, type: FeedbackType } | null>(null);
    const feedbackTimeoutRef = useRef<number | null>(null);

    const showFeedback = (msg: string, type: FeedbackType = 'error') => {
        if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
        setLocalFeedback({ msg, type });
        feedbackTimeoutRef.current = window.setTimeout(() => setLocalFeedback(null), 3000);
    };

    // Handle game initialization if in setup phase
    const handleInitialize = () => {
        initializeGame({ boardSize: 10 });
    };

    // Helper to handle placement result and feedback
    const processPlacement = (ship: Ship) => {
        const result = placePlayerShip(ship);
        if (!result.success) {
            console.warn("Placement failed:", result.message);
            showFeedback(result.message || "Invalid placement", 'error');
        } else {
            showFeedback(`${ship.type} Deployed!`, 'success');
        }
    };

    // Callback onclick on player board
    const handlePlayerCellClick = (row: number, col: number) => {
        if (phase === GamePhase.PLACEMENT) {
            
            // 1. Check if clicking on an existing ship (Pick Up logic)
            const shipAtCell = player.ships.find(ship => {
                if (!ship.position) return false;
                const { row: sRow, col: sCol } = ship.position;
                if (ship.orientation === 'horizontal') {
                    return row === sRow && col >= sCol && col < sCol + ship.size;
                } else {
                    return col === sCol && row >= sRow && row < sRow + ship.size;
                }
            });

            // 2. Place selected ship (Placement logic)
            if (!selectedShipId) {
                showFeedback("Select a ship first", 'warning');
                return;
            }

            const type = selectedShipId.split('-')[0] as ShipType;
            const config = SHIPS_CONFIG[type];

            if (!config) return;

            const newShip: Ship = {
                id: selectedShipId,
                type: type,
                size: config.size,
                position: { row, col },
                orientation: orientation,
                hits: [],
                isSunk: false
            };

            processPlacement(newShip);

        } else if (phase === GamePhase.BATTLE) {
            // In battle, clicking own board does nothing (unless we want to show ships)
            showFeedback("Focus on the enemy board!", 'info');
        }
    };

    // Callback for Enemy Board Click (Attack)
    const handleEnemyCellClick = async (row: number, col: number) => {
        if (phase !== GamePhase.BATTLE) return;
        
        if (currentTurn !== "player") {
            showFeedback("Wait for your turn...", 'warning');
            return;
        }

        const result = await playerAttack({ row, col });
        
        if (result.success) {
            // Feedback is handled by store status updates or we can use the result here
            const type = result.data?.type;
            if (type === 'hit') showFeedback("HIT!", 'success');
            else if (type === 'miss') showFeedback("Miss...", 'info');
             // Sunk is usually handled globally or by a specific slice status
        } else {
            showFeedback(result.message || "Invalid attack", 'error');
        }
    };

    // Callback for Drag Start from Board (Drag-to-Move)
    const handleBoardDragStart = (row: number, col: number, e: React.DragEvent) => {
        if (phase !== GamePhase.PLACEMENT) {
            e.preventDefault();
            return;
        }

        const shipAtCell = player.ships.find(ship => {
            if (!ship.position) return false;
            const { row: sRow, col: sCol } = ship.position;
            // Check based on current orientation of the ship
            if (ship.orientation === 'horizontal') {
                return row === sRow && col >= sCol && col < sCol + ship.size;
            } else {
                return col === sCol && row >= sRow && row < sRow + ship.size;
            }
        });

        if (shipAtCell) {
            const dragData = {
                id: shipAtCell.id,
                type: shipAtCell.type,
                size: shipAtCell.size,
                source: "board",
                originalPosition: shipAtCell.position,
                originalOrientation: shipAtCell.orientation
            };
            e.dataTransfer.setData("application/json", JSON.stringify(dragData));
            e.dataTransfer.effectAllowed = "move";
            selectShip(shipAtCell.id); 

            // Create a temporary element to represent the full ship
            const ghost = document.createElement("div");
            ghost.style.position = "absolute";
            ghost.style.top = "-1000px";
            ghost.style.left = "-1000px";
            ghost.style.display = "flex";
            ghost.style.gap = "2px";
            // Match palette styling (horizontal/vertical) based on ship orientation
            ghost.style.flexDirection = shipAtCell.orientation === 'horizontal' ? 'row' : 'column';
            ghost.style.opacity = "1"; // Browser handles drag ghost opacity automatically usually (0.5)
            
            // Create segments
            for (let i = 0; i < shipAtCell.size; i++) {
                const seg = document.createElement("div");
                seg.style.width = "32px"; // Match UI (w-8)
                seg.style.height = "32px"; // Match UI (h-8)
                seg.style.backgroundColor = "#3b82f6"; // bg-blue-500
                seg.style.border = "1px solid #60a5fa"; // border-blue-400
                seg.style.borderRadius = "2px";
                ghost.appendChild(seg);
            }

            document.body.appendChild(ghost);
            
            // offset so the cursor grabs the specific segment clicked?
            // For simplicity, let's grab the top-left or try to calculate offset.
            // If we drag from index 1, we should shift ghost.
            // Let's just grab center or top-left for now to ensure visibility.
            e.dataTransfer.setDragImage(ghost, 0, 0);

            // Clean up DOM after a tick
            setTimeout(() => {
                document.body.removeChild(ghost);
            }, 0);

        } else {
            e.preventDefault();
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
            const data = JSON.parse(dataStr) as { 
                id: string; 
                type: ShipType; 
                size: number; 
                source?: string;
                originalPosition?: { row: number, col: number };
                originalOrientation?: 'horizontal' | 'vertical';
            };
            const { id, type, size, source, originalPosition, originalOrientation } = data;

            // If moving from board, temporarily remove old instance
            if (source === "board") {
                removePlayerShip(id);
            }

            // Construct Ship object
            const newShip: Ship = {
                id,
                type,
                size,
                position: { row, col },
                orientation: orientation, // Use CURRENT global orientation, or keep original? UX choice. User usually rotates BEFORE drag or expects global. Let's use global.
                hits: [],
                isSunk: false
            };
            
            const result = placePlayerShip(newShip);
            
            if (!result.success) {
                console.warn("Drag placement failed:", result.message);
                
                if (source === "board" && originalPosition && originalOrientation) {
                    // REVERT: Put it back where it was
                    showFeedback("Invalid move - Returning ship", 'warning');
                    const originalShip = { ...newShip, position: originalPosition, orientation: originalOrientation };
                    placePlayerShip(originalShip);
                } else {
                    showFeedback(result.message || "Cannot place ship there", 'error');
                }
            } else {
                showFeedback(`${newShip.type} Deployed!`, 'success');
            }
            
        } catch (err) {
            console.error("Failed to parse drag data", err);
        }
    };

    // --- Derived UI State ---
    const isBattle = phase === GamePhase.BATTLE || phase === GamePhase.GAME_OVER;


    return (
        <main className="min-h-screen w-full bg-slate-900 text-white flex justify-center py-8 px-4">
            <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-[1fr_0.6fr_1fr] gap-6">
                {/* Player Board */}
                <section className="bg-slate-800 rounded-xl p-2 shadow-lg flex flex-col items-center pr-4 relative">
                    <h2 className="text-center mb-3 text-lg font-semibold text-sky-300">
                        Your Fleet
                    </h2>
                     {/* Placement Feedback Overlay */}
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm px-4">
                        <FeedbackMessage 
                            message={localFeedback?.msg || null} 
                            type={localFeedback?.type} 
                            onDismiss={() => setLocalFeedback(null)}
                        />
                    </div>
                    <Board
                        size={10}
                        cells={playerBoard}
                        isPlayerBoard={true}
                        onCellClick={handlePlayerCellClick}
                        onCellDrop={handleDrop}
                        onCellDragOver={handleDragOver}
                        onCellDragStart={handleBoardDragStart}
                        ships={player.ships}
                        forceShowShips={true}
                        disabled={phase === GamePhase.GAME_OVER}
                    />
                </section>

                {/* Game HUD */}
                <section className="bg-slate-800 rounded-xl p-2 shadow-lg flex flex-col gap-4 items-center">
                    <GameHUD onInitialize={handleInitialize} />
                </section>

                {/* AI Board */}
                <section className={`bg-slate-800 rounded-xl p-2 shadow-lg flex flex-col items-center transition-opacity duration-500 ${isBattle ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                    <h2 className="text-center mb-3 text-lg font-semibold text-red-300 flex items-center gap-2">
                        Enemy Waters
                    </h2>
                    <Board
                        size={10}
                        cells={aiBoard}
                        isPlayerBoard={true} // Hide ships
                        onCellClick={handleEnemyCellClick}
                        // Disable interactions if not battle or not player turn
                        disabled={!isBattle || currentTurn !== 'player'}
                    />
                </section>
            </div>
        </main>
    );
}
