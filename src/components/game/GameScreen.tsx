"use client";

import Board from "./Board";
import { ShipPalette } from "./ShipPalette";
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

    // Callback onclick on player board (restored)
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
                // Warning handled by HUD instructions or validation
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
                hits: new Array(config.size).fill(false),
                isSunk: false
            };

            processPlacement(newShip);

        } else if (phase === GamePhase.BATTLE) {
            // No action on click own board
        }
    };
    const handleEnemyCellClick = async (row: number, col: number) => {
        if (phase !== GamePhase.BATTLE) return;
        
        if (currentTurn !== "player") {
            // Optional: Store could emit a transient error in global state if we want strict feedback here
            return;
        }

        await playerAttack({ row, col });
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
                orientation: orientation, 
                hits: new Array(size).fill(false),
                isSunk: false
            };
            
            const result = placePlayerShip(newShip);
            
            if (!result.success) {
                console.warn("Drag placement failed:", result.message);
                
                if (source === "board" && originalPosition && originalOrientation) {
                    // REVERT: Put it back where it was
                    const originalShip = { ...newShip, position: originalPosition, orientation: originalOrientation };
                    placePlayerShip(originalShip);
                } 
            }
            
        } catch (err) {
            console.error("Failed to parse drag data", err);
        }
    };

    // Handle game initialization if in setup phase
    const handleInitialize = () => {
        initializeGame({ boardSize: 10 });
    };

    // Helper to handle placement result - but feedback now handled by HUD or console
    const processPlacement = (ship: Ship) => {
        const result = placePlayerShip(ship);
        if (!result.success) {
            console.warn("Placement failed:", result.message);
        }
    };

    // --- Derived UI State ---
    const isBattle = phase === GamePhase.BATTLE || phase === GamePhase.GAME_OVER;
    const [activeTab, setActiveTab] = useState<'player' | 'enemy'>('player');

    return (
        <div className="h-screen w-screen overflow-hidden bg-slate-900 text-slate-100">
            <GameHUD onInitialize={handleInitialize} />
        </div>

        // <main className="h-[100dvh] w-full bg-slate-900 text-white flex flex-col overflow-hidden">
        //     {/* Header HUD - Flex none to prevent shrinking */}
        //     <div className="flex-none z-30 relative">
        //         <GameHUD onInitialize={handleInitialize} />
        //     </div>

        //     {/* Mobile Tab Navigation (Visible only on mobile) */}
        //     <div className="flex-none flex md:hidden border-b border-slate-700 bg-slate-800/50 backdrop-blur-md z-20">
        //         <button 
        //             onClick={() => setActiveTab('player')}
        //             className={`flex-1 py-3 text-xs font-bold tracking-wider transition-colors duration-200 ${
        //                 activeTab === 'player' 
        //                     ? 'text-sky-400 border-b-2 border-sky-400 bg-slate-800/80' 
        //                     : 'text-slate-500 hover:text-slate-300'
        //             }`}
        //         >
        //             YOUR FLEET
        //         </button>
        //         <button 
        //             onClick={() => setActiveTab('enemy')}
        //             className={`flex-1 py-3 text-xs font-bold tracking-wider transition-colors duration-200 ${
        //                 activeTab === 'enemy' 
        //                     ? 'text-red-400 border-b-2 border-red-400 bg-slate-800/80' 
        //                     : 'text-slate-500 hover:text-slate-300'
        //             }`}
        //         >
        //             ENEMY WATERS
        //         </button>
        //     </div>

        //     {/* Main Game Area */}
        //     <div className="flex-1 relative overflow-y-auto overflow-x-hidden p-2 md:p-4 lg:p-6">
        //         <div className="h-full w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 transition-all">
                    
        //             {/* Player Board Section */}
        //             <section className={`
        //                 ${activeTab === 'player' ? 'flex' : 'hidden'} 
        //                 md:flex flex-col items-center flex-1
        //                 bg-slate-800/40 rounded-xl p-2 md:p-4 
        //                 border border-white/5 shadow-xl
        //                 transition-all duration-300
        //             `}>
        //                 <h2 className="text-center mb-3 text-lg font-semibold text-sky-300 tracking-wide">
        //                     Your Fleet
        //                 </h2>
        //                 <div className="w-full max-w-[400px] aspect-square">
        //                     <Board
        //                         size={10}
        //                         cells={playerBoard}
        //                         isPlayerBoard={true}
        //                         onCellClick={handlePlayerCellClick}
        //                         onCellDrop={handleDrop}
        //                         onCellDragOver={handleDragOver}
        //                         onCellDragStart={handleBoardDragStart}
        //                         ships={player.ships}
        //                         forceShowShips={true}
        //                         disabled={phase === GamePhase.GAME_OVER}
        //                     />
        //                 </div>
        //             </section>

        //             {/* AI Board Section */}
        //             <section className={`
        //                 ${activeTab === 'enemy' ? 'flex' : 'hidden'} 
        //                 md:flex flex-col items-center flex-1
        //                 bg-slate-800/40 rounded-xl p-2 md:p-4 
        //                 border border-white/5 shadow-xl
        //                 transition-all duration-300
        //                 ${isBattle ? 'opacity-100' : 'md:opacity-50 md:pointer-events-none'}
        //             `}>
        //                 <h2 className="text-center mb-3 text-lg font-semibold text-red-300 flex items-center gap-2 tracking-wide">
        //                     Enemy Waters
        //                 </h2>
        //                 <div className="w-full max-w-[400px] aspect-square">
        //                     <Board
        //                         size={10}
        //                         cells={aiBoard}
        //                         isPlayerBoard={false}
        //                         onCellClick={handleEnemyCellClick}
        //                         disabled={!isBattle || currentTurn !== 'player'}
        //                     />
        //                 </div>
        //             </section>
        //         </div>
        //     </div>

        //     {/* Ship Palette Overlay (Placement Phase Only) */}
        //     {phase === GamePhase.PLACEMENT && (
        //         <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4">
        //             <div className="bg-slate-800/95 backdrop-blur-sm border border-slate-600 shadow-2xl rounded-xl p-3 flex flex-col gap-2 animate-slide-up">
        //                 <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-1">
        //                     <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Fleet Command</span>
        //                     <span className="text-[10px] text-slate-500">Drag ships to board</span>
        //                 </div>
        //                 <ShipPalette />
        //             </div>
        //         </div>
        //     )}
        // </main>
    );
}