"use client";

import { cn } from "@/lib/utils/utils";
import { GamePhase } from "@/lib/store/game-types";
import { useGameStore } from "@/lib/store/game-store";
import { useShallow } from "zustand/react/shallow";

export const ReadinessIndicators: React.FC = () => {
  const { playerReady, aiReady } = useGameStore(
    useShallow((state) => ({
      playerReady: state.player.isReady,
      aiReady: state.ai.isReady,
    }))
  );

  return (
    <div className="flex flex-row md:flex-col gap-4 md:gap-2">
      <div className="flex items-center gap-2">
        <div className={cn(
          "w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors",
          playerReady 
            ? "bg-green-500/20 border-green-500 text-green-400" 
            : "bg-yellow-500/20 border-yellow-500 text-yellow-400"
        )}>
          {playerReady ? "✓" : "○"}
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Player Ready</span>
      </div>

      <div className="flex items-center gap-2">
        <div className={cn(
          "w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors",
          aiReady 
            ? "bg-green-500/20 border-green-500 text-green-400" 
            : "bg-yellow-500/20 border-yellow-500 text-yellow-400"
        )}>
          {aiReady ? "✓" : "○"}
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Ready</span>
      </div>
    </div>
  );
};

