"use client";

import { useState, useRef, useEffect } from "react";

import { useShallow } from "zustand/react/shallow";



import { FeedbackType } from "./GameStage/FeedbackMessage";

import { Header } from "./Header";

import { GameStage } from "./GameStage/GameStage";


import { useSupportsHover } from "@/lib/device/useSupportsHover";

import { useGameplayStore } from "@/lib/store/gameplay-store";

export function GameScreen() {
    const supportsHover = useSupportsHover();

    const initializeGame = useGameplayStore(
        state => state.initializeGame
    );

    const handleInitialize = () => {
        initializeGame();
    };


    return (
        <div className="min-h-[100dvh] w-full bg-slate-900 text-slate-100 flex flex-col overflow-hidden relative">
            <Header 
                onInitialize={handleInitialize} 
            />
            <GameStage 
                supportsHover={supportsHover}
                onPlayerCellClick={(r, c) => {
                    // playerAttack({ row: r, col: c });
                }}
            />
        </div>
    );
}