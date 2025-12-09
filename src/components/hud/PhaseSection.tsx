"use client";

import { useGameStore } from "@/lib/store/game-store";
import { useShallow } from "zustand/react/shallow";
import { getPhaseColor, getPhaseLabel } from "./hud.utils";
/**
 * PhaseSection
 *
 * Displays the current game phase (SETUP / PLACEMENT / BATTLE / GAME_OVER).
 *
 * Responsibility:
 * - Render phase label and color based on global game state.
 */
export function PhaseSection() {
    /**
     * Fine-grained Zustand selector
     *
     * - Selects a single primitive value (`GamePhase`)
     * - Allows Zustand to rely on Object.is comparison
     */
    const phase = useGameStore(
        useShallow((state) => state.phase)
    );

    return (
        <div className="flex flex-col gap-1">
            {/* Static label */}
            <span className="text-sm text-slate-400">Phase</span>
            {/* 
                Dynamic phase display:
                - Text and color derived via lookup helpers
                - Keeps rendering logic declarative and readable
            */}
            <span className={`text-lg font-semibold ${getPhaseColor(phase)}`}>
                {getPhaseLabel(phase)}
            </span>
        </div>
    );
}
