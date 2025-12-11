"use client";

import { useGameStore } from "@/lib/store/game-store";
import { useShallow } from "zustand/react/shallow";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function ShipsRemainingSection() {
  const { playerRemaining, aiRemaining } = useGameStore(
    useShallow((state) => ({
      playerRemaining: state.player.ships.filter((s) => !s.isSunk).length,
      aiRemaining: state.ai.ships.filter((s) => !s.isSunk).length,
    }))
  );

  return (
    <Card className="flex flex-col gap-2">
      <span className="text-sm text-slate-400">Ships Remaining</span>
      <div className="text-md space-y-2">
        <div className="flex items-center justify-between">
          <Badge className="bg-slate-800 text-green-400">🧭 Player</Badge>
          <Badge className="bg-slate-800 text-green-400 font-bold">
            {playerRemaining}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <Badge className="bg-slate-800 text-orange-400">🤖 AI</Badge>
          <Badge className="bg-slate-800 text-orange-400 font-bold">
            {aiRemaining}
          </Badge>
        </div>
      </div>
    </Card>
  );
}
