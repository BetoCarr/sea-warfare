"use client";

import { useState, useRef } from "react";
import { useGameStore } from "@/lib/store/game-store";
import { GamePhase } from "@/lib/store/game-types";
import { useShallow } from "zustand/react/shallow";

// ============================================================================
// CONSTANTS & HELPERS
// ============================================================================
const PHASE_LABELS: Record<GamePhase, string> = {
    [GamePhase.SETUP]: "Setup",
    [GamePhase.PLACEMENT]: "Placement",
    [GamePhase.BATTLE]: "Battle",
    [GamePhase.GAME_OVER]: "Game Over",
};

const PHASE_COLORS: Record<GamePhase, string> = {
    [GamePhase.SETUP]: "text-gray-400",
    [GamePhase.PLACEMENT]: "text-yellow-400",
    [GamePhase.BATTLE]: "text-green-400",
    [GamePhase.GAME_OVER]: "text-red-400",
};

function getPhaseLabel(phase: GamePhase): string {
    return PHASE_LABELS[phase] ?? "Unknown";
}

function getPhaseColor(phase: GamePhase): string {
    return PHASE_COLORS[phase] ?? "text-white";
}

function getTurnLabel(turn: 'player' | 'ai'): string {
    return turn === 'player' ? "🎯 Your turn" : "🤖 AI's turn";
}

function getTurnColor(turn: 'player' | 'ai'): string {
    return turn === 'player' ? "text-green-400" : "text-orange-400";
}

function getButtonLabel(playerReady: boolean, aiReady: boolean): string {
    if (playerReady && aiReady) return "⚔️ Start Battle";
    if (!playerReady) return "📍 Place your ships...";
    if (!aiReady) return "⏳ Waiting for AI...";
    return "Waiting...";
}

// ============================================================================
// COMPONENT
// ============================================================================
export function Sidebar() {
    const [feedback, setFeedback] = useState<string | null>(null);
    const timeoutRef = useRef<number | null>(null);

    const { phase, currentTurn, player, ai, confirmPlacement } = useGameStore(
    useShallow((state) => ({
        phase: state.phase,
        currentTurn: state.currentTurn,
        player: state.player,
        ai: state.ai,
        confirmPlacement: state.confirmPlacement,
    }))
);

    // derivaciones fuera del selector (buena práctica)
    const playerShipsCount = player.ships.length;
    const aiShipsCount = ai.ships.length;
    const playerReady = player.isReady;
    const aiReady = ai.isReady;


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

            {/* Phase Section */}
            <div className="flex flex-col gap-1">
                <span className="text-sm text-slate-400">Phase</span>
                <span className={`text-lg font-semibold ${getPhaseColor(phase)}`}>
                    {getPhaseLabel(phase)}
                </span>
            </div>

            {/* Turn Section */}
            {phase === GamePhase.BATTLE && (
                <div className="flex flex-col gap-1">
                    <span className="text-sm text-slate-400">Current Turn</span>
                    <span className={`text-lg font-semibold ${getTurnColor(currentTurn)}`}>
                        {getTurnLabel(currentTurn)}
                    </span>
                </div>
            )}

            {/* Ships Remaining */}
            <div className="flex flex-col gap-2">
                <span className="text-sm text-slate-400">Ships Remaining</span>
                <div className="text-md space-y-2">
                    <div className="flex items-center justify-between">
                        <span>🧭 Player:</span>
                        <span className="font-mono font-bold text-green-400">
                            {playerShipsCount}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span>🤖 AI:</span>
                        <span className="font-mono font-bold text-orange-400">
                            {aiShipsCount}
                        </span>
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
                    {getButtonLabel(playerReady, aiReady)}
                </button>
            )}
        </aside>
    );


    // return (
    //     <aside
    //         className="w-full md:w-64 bg-slate-900 text-white p-4 rounded-lg
    //                     flex flex-col gap-4 border border-slate-700 shadow-lg"
    //     >
    //     <h2 className="text-xl font-bold">Game Info</h2>

    //     {/* Phase */}
    //     <div className="flex flex-col">
    //         <span className="text-sm text-slate-400">Phase</span>
    //         <span className="text-lg font-semibold">
    //             {phase === GamePhase.SETUP && "Setup"}
    //             {phase === GamePhase.PLACEMENT && "Placement"}
    //             {phase === GamePhase.BATTLE && "Battle"}
    //             {phase === GamePhase.GAME_OVER && "Game Over"}
    //         </span>
    //     </div>

    //     {/* Turn */}
    //     {phase === GamePhase.BATTLE && (
    //         <div className="flex flex-col">
    //             <span className="text-sm text-slate-400">Turn</span>
    //             <span className="text-lg font-semibold">
    //                 {currentTurn === "player" ? "Your turn" : "AI's turn"}
    //             </span>
    //         </div>
    //     )}

    //     {/* Ships */}
    //     <div className="flex flex-col">
    //         <span className="text-sm text-slate-400">Ships Remaining</span>
    //         <div className="text-md">
    //             <p>🧭 Player: {player?.ships.length ?? 0}</p>
    //             <p>🤖 AI: {ai?.ships.length ?? 0}</p>
    //         </div>
    //     </div>

    //     {/* Confirm placement */}
    //     {phase === GamePhase.PLACEMENT && (
    //         <button
    //             onClick={handleConfirm}
    //             disabled={!player?.isReady || !ai?.isReady}
    //             className="mt-4 py-2 px-3 rounded bg-blue-600 disabled:bg-slate-700
    //                     hover:bg-blue-500 transition-colors"
    //         >
    //         {player?.isReady && ai?.isReady
    //             ? "Start Battle"
    //             : "Waiting..."}
    //         </button>
    //     )}
    //     </aside>
    // );
}