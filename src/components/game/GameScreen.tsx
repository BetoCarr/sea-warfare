"use client";

import { useState, useRef, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { useGameStore } from "@/lib/store/game-store";
import { GamePhase } from "@/lib/store/game-types";
import type { Ship, ShipType } from "@/lib/utils/types";
import { BOARD_SIZE, SHIPS_CONFIG } from "@/lib/utils/constants";
import { GameHUD } from "../hud/GameHUD";
import { FeedbackType } from "../hud/FeedbackMessage";
import { GameStage } from "./GameStage";
import { GameFooter } from "../hud/GameFooter";
import { ShipPalette } from "./ShipPalette";
import { useShipPlacement } from "@/application/placement/useShipPlacement";

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
        initializeGame,
        confirmPlacement,
        lastAttack
    } = useGameStore(
        useShallow((state) => ({
            player: state.player,
            ai: state.ai,
            phase: state.phase,
            currentTurn: state.currentTurn,
            playerAttack: state.playerAttack,
            initializeGame: state.initializeGame,
            confirmPlacement: state.confirmPlacement,
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

    // --- Placement Hook (Decoupled Architecture) ---
    const placementCore = useShipPlacement();
    // const placementBridge = useShipPlacementBridge(placementCore);

    const activeMessage = feedback || instruction;
    const activeType = feedback ? feedbackType : 'instruction';

    const handleInitialize = () => initializeGame({ boardSize: BOARD_SIZE });

    /**
     * Master Bridge: Connects Board intents to the Bridge handlers.
     */
    // const handleBoardInteract = (type: 'start' | 'commit' | 'hover' | 'cancel', row: number, col: number, e: any) => {
    //     switch (type) {
    //         case 'start': placementBridge.dragHandlers.onDragStart(row, col, e); break;
    //         case 'commit': placementBridge.dragHandlers.onDrop(row, col, e); break;
    //         case 'hover': placementBridge.dragHandlers.onDragOver(row, col, e); break;
    //         case 'cancel': placementBridge.dragHandlers.onDragEnd(); break;
    //     }
    // };

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
                onPlayerCellClick={(r, c) => {
                    if (phase === GamePhase.PLACEMENT) {
                        placementBridge.interactionHandlers.onClick(r, c);
                    } else if (phase === GamePhase.BATTLE && currentTurn === 'player') {
                        playerAttack({ row: r, col: c });
                    }
                }}
                onCellInteract={handleBoardInteract}
                draggingShipId={placementCore.state.draggingShipId}
                preview={placementCore.state.preview}
            />

            <GameFooter />
        </div>
    );
}