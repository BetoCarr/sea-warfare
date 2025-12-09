"use client";

import { useGameStore } from "@/lib/store/game-store";
import { GamePhase } from "@/lib/store/game-types";
import { useShallow } from "zustand/react/shallow";
import { getTurnColor, getTurnLabel } from "./hud.utils";

export function TurnSection() {
    const { phase, currentTurn } = useGameStore(
        useShallow((state) => ({
            phase: state.phase,
            currentTurn: state.currentTurn,
        }))
    );

    if (phase !== GamePhase.BATTLE) {
        return null;
    }

    return (
        <div className="flex flex-col gap-1">
            <span className="text-sm text-slate-400">Current Turn</span>
            <span className={`text-lg font-semibold ${getTurnColor(currentTurn)}`}>
                {getTurnLabel(currentTurn)}
            </span>
        </div>
    );
}
