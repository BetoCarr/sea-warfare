"use client";

import { useState, useRef, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { useGameStore } from "@/lib/store/game-store";
import { GamePhase } from "@/lib/store/game-types";
import type { Ship, ShipType } from "@/lib/utils/types";
import { SHIPS_CONFIG } from "@/lib/utils/constants";
import { GameHUD } from "../hud/GameHUD";
import { FeedbackType } from "../hud/FeedbackMessage";
import { GameStage } from "./GameStage";
import { GameFooter } from "../hud/GameFooter";

export function GameScreen() {
    const [feedback, setFeedback] = useState<string | null>(null);
    const [feedbackType, setFeedbackType] = useState<FeedbackType>('info');
    const timeoutRef = useRef<number | null>(null);

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
        confirmPlacement,
        selectedShipId,
        orientation,
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
            confirmPlacement: state.confirmPlacement,
            selectedShipId: state.selectedShipId,
            orientation: state.orientation,
            lastAttack: state.lastAttack,
        }))
    );

    const playerReady = player.isReady;
    const aiReady = ai.isReady;

    // --- Feedback Logic ---
    useEffect(() => {
        if (lastAttack) {
            let msg = "";
            let type: FeedbackType = 'info';

            if (lastAttack.by === 'ai') {
                const msgs = {
                    'hit': "AI Hit your ship! 💥",
                    'sunk': "AI Sunk your ship! 💀",
                    'miss': "AI Missed... 🌊",
                    'invalid': ""
                };
                msg = msgs[lastAttack.type] || "";
                type = (lastAttack.type === 'hit' || lastAttack.type === 'sunk') ? 'error' : 'warning';
            } else {
                const msgs = {
                    'hit': "Direct Hit! 🎯",
                    'sunk': "Enemy Ship Sunk! 🎆",
                    'miss': "Missed target... 💨",
                    'invalid': "Invalid Coordinates 🚫"
                };
                msg = msgs[lastAttack.type] || "";
                type = (lastAttack.type === 'hit' || lastAttack.type === 'sunk') ? 'success' : 'warning';
            }

            if (msg) {
                setFeedback(msg);
                setFeedbackType(type);
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                timeoutRef.current = window.setTimeout(() => setFeedback(null), 3000);
            }
        }
    }, [lastAttack]);

    const handleConfirm = () => {
        const result = confirmPlacement();
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        
        setFeedback(result.message || (result.success ? "Battle phase initiated! ⚔️" : "Placement incomplete"));
        setFeedbackType(result.success ? 'success' : 'error');
        timeoutRef.current = window.setTimeout(() => setFeedback(null), result.success ? 3000 : 5000);
        return result;
    };

    const instruction = (() => {
        switch (phase) {
            case GamePhase.SETUP:
                return "Initialize combat protocols...";
            case GamePhase.PLACEMENT:
                if (playerReady && aiReady) return "Systems optimal. Ready for engagement!";
                return "Distribute your fleet across the sector";
            case GamePhase.BATTLE:
                return (currentTurn === 'player') 
                    ? "Targeting systems active. Select coordinates." 
                    : "Enemy turn... awaiting impact.";
            default:
                return null;
        }
    })();

    const activeMessage = feedback || instruction;
    const activeType = feedback ? feedbackType : 'instruction';

    // --- Board Handlers ---
    const handlePlayerCellClick = (row: number, col: number) => {
        if (phase === GamePhase.PLACEMENT) {
            if (!selectedShipId) return;

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

            const result = placePlayerShip(newShip);
            if (!result.success) console.warn("Placement failed:", result.message);

        }
    };

    const handleBoardDragStart = (row: number, col: number, e: React.DragEvent) => {
        if (phase !== GamePhase.PLACEMENT) {
            e.preventDefault();
            return;
        }

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

            // Create temporary ghost element for drag image
            const ghost = document.createElement("div");
            ghost.style.position = "absolute";
            ghost.style.top = "-1000px";
            ghost.style.left = "-1000px";
            ghost.style.display = "flex";
            ghost.style.gap = "2px";
            ghost.style.flexDirection = shipAtCell.orientation === 'horizontal' ? 'row' : 'column';
            
            for (let i = 0; i < shipAtCell.size; i++) {
                const seg = document.createElement("div");
                seg.style.width = "32px";
                seg.style.height = "32px";
                seg.style.backgroundColor = "#3b82f6";
                seg.style.border = "1px solid #60a5fa";
                seg.style.borderRadius = "2px";
                ghost.appendChild(seg);
            }

            document.body.appendChild(ghost);
            e.dataTransfer.setDragImage(ghost, 0, 0);
            setTimeout(() => document.body.removeChild(ghost), 0);
        } else {
            e.preventDefault();
        }
    };

    const handleDragOver = (row: number, col: number, e: React.DragEvent) => {
        if (phase === GamePhase.PLACEMENT) e.preventDefault();
    };

    const handleDrop = (row: number, col: number, e: React.DragEvent) => {
        if (phase !== GamePhase.PLACEMENT) return;
        e.preventDefault();

        const dataStr = e.dataTransfer.getData("application/json");
        if (!dataStr) return;

        try {
            const data = JSON.parse(dataStr);
            const { id, type, size, source, originalPosition, originalOrientation } = data;

            if (source === "board") removePlayerShip(id);

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
            if (!result.success && source === "board" && originalPosition && originalOrientation) {
                placePlayerShip({ ...newShip, position: originalPosition, orientation: originalOrientation });
            }
        } catch (err) {
            console.error("Failed to parse drag data", err);
        }
    };

    const handleInitialize = () => initializeGame({ boardSize: 10 });

    return (
        <div className="min-h-[100dvh] w-full bg-slate-900 text-slate-100 flex flex-col overflow-hidden relative">
            <GameHUD 
                onInitialize={handleInitialize} 
                onConfirm={handleConfirm}
            />

            <GameStage 
                activeMessage={activeMessage}
                activeType={activeType}
                onDismissFeedback={() => setFeedback(null)}
                onPlayerCellClick={handlePlayerCellClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onBoardDragStart={handleBoardDragStart}
            />

            <GameFooter />
        </div>
    );
}