"use client";

import { useGameStore } from "@/lib/store/game-store";
import { GamePhase } from "@/lib/store/game-types";
import { useShallow } from "zustand/react/shallow";
import { getTurnLabel } from "./hud.utils";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

/**
 * TurnSection
 *
 * Shows whose turn it is during the BATTLE phase.
 * Uses Card and Badge from the design system and token‑based colors.
 */
export function TurnSection() {
  const { phase, currentTurn } = useGameStore(
    useShallow((state) => ({
      phase: state.phase as GamePhase,
      currentTurn: state.currentTurn,
    }))
  );

  if (phase !== GamePhase.BATTLE) {
    return null;
  }

  const turnColorClass = `text-[var(--color-turn-${currentTurn})]`;

  return (
    <Card className="flex flex-col gap-1">
      <span className="text-sm text-slate-400">Current Turn</span>
      <Badge className={`text-lg font-semibold ${turnColorClass}`}>
        {getTurnLabel(currentTurn)}
      </Badge>
    </Card>
  );
}
