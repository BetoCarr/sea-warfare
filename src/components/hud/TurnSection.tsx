"use client";

import { useGameStore } from "@/lib/store/game-store";
import { GamePhase } from "@/lib/store/game-types";
import { useShallow } from "zustand/react/shallow";
import { getTurnLabel } from "./hud.utils";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Section } from "@/components/ui/layout/Section";

/**
 * TurnSection
 * Shows whose turn it is during the BATTLE phase.
 * Uses Card, Section and Badge from the design system.
 */
export function TurnSection() {
  const { phase, currentTurn } = useGameStore(
    useShallow((state) => ({
      phase: state.phase as GamePhase,
      currentTurn: state.currentTurn,
    }))
  );

  if (phase !== GamePhase.BATTLE) return null;

  const turnColorClass = `text-[var(--color-turn-${currentTurn})]`;

  return (
    <Card className="flex flex-col gap-1">
      <Section title="Current Turn">
        <Badge className={`text-lg font-semibold ${turnColorClass}`}>
          {getTurnLabel(currentTurn)}
        </Badge>
      </Section>
    </Card>
  );
}
