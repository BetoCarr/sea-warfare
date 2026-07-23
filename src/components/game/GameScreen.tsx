"use client";

import { useState, useRef, useEffect } from "react";

import { useShallow } from "zustand/react/shallow";



import { FeedbackType } from "./GameStage/FeedbackMessage";

import { Header } from "./Header";

import { GameStage } from "./GameStage/GameStage";

import { useGameFlowController } from "@/application/game-flow/useGameFlowController";

import { usePlacementFlow } from "@/application/placement/hooks/usePlacementFlow";

import { useSupportsHover } from "@/lib/device/useSupportsHover";

import { useGameplayStore } from "@/lib/store/gameplay-store";

export function GameScreen() {
    const [feedback, setFeedback] = useState<string | null>(null);
    const [feedbackType, setFeedbackType] = useState<FeedbackType>('info');

    const supportsHover = useSupportsHover();

    const flow = useGameFlowController();
    
    const placement = usePlacementFlow()


    const initializeGame = useGameplayStore(
        state => state.initializeGame
    );

    const handleInitialize = () => {
        initializeGame();
    };

    const activeMessage = feedback || placement.presentation.message || flow.presentation.description;
    const activeType = feedback ? feedbackType : 'instruction';


    return (
        <div className="min-h-[100dvh] w-full bg-slate-900 text-slate-100 flex flex-col overflow-hidden relative">
            <Header 
                onInitialize={handleInitialize} 
            />
            <GameStage 
                activeMessage={activeMessage}
                activeType={activeType}
                supportsHover={supportsHover}
                onDismissFeedback={() => setFeedback(null)}
                onPlayerCellClick={(r, c) => {
                    // playerAttack({ row: r, col: c });
                }}
            />
        </div>
    );
}