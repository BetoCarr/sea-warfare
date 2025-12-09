"use client";

import { useState, useRef } from "react";
import { useGameStore } from "@/lib/store/game-store";
import { GamePhase } from "@/lib/store/game-types";
import { useShallow } from "zustand/react/shallow";
import { PhaseSection } from "./PhaseSection";
import { TurnSection } from "./TurnSection";
import { ShipsRemainingSection } from "./ShipsRemainingSection";

export function GameHUD() {
    const [feedback, setFeedback] = useState<string | null>(null);
    const timeoutRef = useRef<number | null>(null);
    
    const {
        phase,
        currentTurn,

        playerReady,
        aiReady,

        playerHits,
        playerMisses,

        aiHits,
        aiMisses,

        playerShipsRemaining,
        aiShipsRemaining,

        totalPlayerShips,
        totalAiShips,

        confirmPlacement,
    } = useGameStore(
    useShallow((state) => ({
        phase: state.phase,
        currentTurn: state.currentTurn,

        playerReady: state.player.isReady,
        aiReady: state.ai.isReady,

        playerHits: state.player.boardState.hits.length,
        playerMisses: state.player.boardState.misses.length,
        aiHits: state.ai.boardState.hits.length,
        aiMisses: state.ai.boardState.misses.length,

        playerShipsRemaining: state.player.ships.filter(s => !s.isSunk).length,
        aiShipsRemaining: state.ai.ships.filter(s => !s.isSunk).length,

        totalPlayerShips: state.player.ships.length,
        totalAiShips: state.ai.ships.length,

        confirmPlacement: state.confirmPlacement,
    }))
);

     // Confirm placement / Start battle
    const handleConfirm = () => {
        const result = confirmPlacement();
        console.log("[UI] confirmPlacement result:", result);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        setFeedback(result.success ? "Battle started! 🎮" : result.message || "Cannot start game");
        timeoutRef.current = window.setTimeout(() => setFeedback(null), 3000);
    };

    return (
        <aside
            className="w-full md:w-64 bg-slate-900 text-white p-4 rounded-lg
                        flex flex-col gap-4 border border-slate-700 shadow-lg"
        >
            <h2 className="text-xl font-bold border-b border-slate-700 pb-2">
                🎮 Game Info
            </h2>

            <PhaseSection />
            <TurnSection />
            <ShipsRemainingSection />
            
            {/* Board Stats */}
            <div className="flex flex-col gap-2">
                <span className="text-sm text-slate-400">Board Stats</span>
                <div className="bg-slate-800 p-3 rounded border border-slate-700 space-y-3">
                    {/* Player Board */}
                    <div>
                        <p className="text-sm font-semibold text-green-400">Player Board</p>
                        <p className="text-xs text-slate-300">
                            Hits: <span className="font-bold">{playerHits}</span> 
                            Misses: <span className="font-bold">{playerMisses}</span> 
                        </p>
                        <p className="text-xs text-slate-400">
                            Ships: {totalPlayerShips}
                        </p>
                    </div>

                    {/* AI Board */}
                    <div>
                        <p className="text-sm font-semibold text-orange-400">AI Board</p>
                        <p className="text-xs text-slate-300">
                            Hits: <span className="font-bold">{aiHits}</span> •
                            Misses: <span className="font-bold">{aiMisses}</span>
                        </p>
                        <p className="text-xs text-slate-400">
                            Ships: {totalAiShips}
                        </p>
                    </div>
                </div>
            </div>
            {/* Readiness Indicators */}
            {phase === GamePhase.PLACEMENT && (
                <div className="flex flex-col gap-2 text-sm">
                    <div className="flex items-center gap-2">
                        <span className={playerReady ? "text-green-400" : "text-yellow-400"}>
                            {playerReady ? "✓" : "○"}
                        </span>
                        <span className="text-slate-300">Player Ready</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={aiReady ? "text-green-400" : "text-yellow-400"}>
                            {aiReady ? "✓" : "○"}
                        </span>
                        <span className="text-slate-300">AI Ready</span>
                    </div>
                </div>
            )}

            {/* Feedback Message */}
            {feedback && (
                <div className="text-sm p-2 rounded bg-slate-800 text-center
                            border border-slate-600">
                    {feedback}
                </div>
            )}

            {/* Start Battle Button */}
            {phase === GamePhase.PLACEMENT && (
                <button
                    onClick={handleConfirm}
                    disabled={!playerReady || !aiReady}
                    className="mt-auto py-3 px-4 rounded font-semibold
                            bg-blue-600 hover:bg-blue-500
                            disabled:bg-slate-700 disabled:text-slate-500
                            disabled:cursor-not-allowed
                            transition-all duration-200
                            hover:scale-105 active:scale-95"
                >
                    {/* {getButtonLabel(playerReady, aiReady)} */}
                </button>
            )}
        </aside>
    );
}
