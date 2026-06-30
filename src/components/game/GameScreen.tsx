"use client";

import { useState, useRef, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { useGameStore } from "@/lib/store/game-store";
import { useGameplayStore } from "@/lib/store/gameplay/gameplay-store";
import { BOARD_SIZE } from "@/lib/utils/constants";
import { GameHUD } from "../hud/GameHUD";
import { FeedbackType } from "../hud/FeedbackMessage";
import { GameStage } from "./GameStage";
import { GameFooter } from "../hud/GameFooter";
import { useGameFlowController } from "@/application/game-flow/useGameFlowController";
import { useSupportsHover } from "@/lib/device/useSupportsHover";
import { usePlacementFlow } from "@/application/placement/hooks/usePlacementFlow";

export function GameScreen() {
    const [feedback, setFeedback] = useState<string | null>(null);
    const [feedbackType, setFeedbackType] = useState<FeedbackType>('info');
    const timeoutRef = useRef<number | null>(null);

    const supportsHover = useSupportsHover();

    const flow = useGameFlowController();
    const placement = usePlacementFlow()

    const {
        playerAttack,
        // initializeGame,
        lastAttack
    } = useGameStore(
        useShallow((state) => ({
            playerAttack: state.playerAttack,
            // initializeGame: state.initializeGame,
            lastAttack: state.lastAttack,
        }))
    );

    const initializeGame = useGameplayStore(
        state => state.initializeGame
    );

    const handleInitialize = () => {
        initializeGame();
    };
    
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

    const activeMessage = feedback || placement.presentation.message || flow.presentation.message;
    const activeType = feedback ? feedbackType : 'instruction';

    // const handleInitialize = () => initializeGame({ boardSize: BOARD_SIZE });

    return (
        <div className="min-h-[100dvh] w-full bg-slate-900 text-slate-100 flex flex-col overflow-hidden relative">
            <GameHUD 
                onInitialize={handleInitialize} 
            />
            <GameStage 
                activeMessage={activeMessage}
                activeType={activeType}
                supportsHover={supportsHover}
                onDismissFeedback={() => setFeedback(null)}
                onPlayerCellClick={(r, c) => {
                    playerAttack({ row: r, col: c });
                }}
            />
            <GameFooter />
        </div>
    );
}