"use client";

import { useGameStore } from "@/lib/store/game-store";
import { useShallow } from "zustand/react/shallow";

export function ShipsRemainingSection() {
    const { playerRemaining, aiRemaining } = useGameStore(
        useShallow((state) => ({
            playerRemaining: state.player.ships.filter(s => !s.isSunk).length,
            aiRemaining: state.ai.ships.filter(s => !s.isSunk).length,
        }))
    );

    return (
        <div className="flex flex-col gap-2">
            <span className="text-sm text-slate-400">Ships Remaining</span>
            <div className="text-md space-y-2">
                <div className="flex items-center justify-between">
                    <span>🧭 Player:</span>
                    <span className="font-mono font-bold text-green-400">
                        {playerRemaining}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <span>🤖 AI:</span>
                    <span className="font-mono font-bold text-orange-400">
                        {aiRemaining}
                    </span>
                </div>
            </div>
        </div>
    );
    }
