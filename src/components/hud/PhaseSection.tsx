"use client";

import { useGameStore } from "@/lib/store/game-store";
import { useShallow } from "zustand/react/shallow";
import { getPhaseLabel } from "./hud.utils";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { GamePhase } from "@/lib/store/game-types";
import { Section } from "@/components/ui/layout/Section";

/**
 * PhaseSection
 * Displays the current game phase (SETUP / PLACEMENT / BATTLE / GAME_OVER).
 * Uses the design system's Card, Section and Badge components for consistent styling.
 */
export function PhaseSection() {
  // Select the current phase from the global store with proper typing
  const phase = useGameStore(useShallow((state) => state.phase as GamePhase));

  // Map phase enum to a CSS variable based color class
  const phaseColorClass = `text-[var(--color-phase-${phase
    .toString()
    .toLowerCase()}])`;

  return (
    <Card className="flex flex-col gap-1">
      <Section title="Phase">
        <Badge className={`text-lg font-semibold ${phaseColorClass}`}>
          {getPhaseLabel(phase)}
        </Badge>
      </Section>
    </Card>
  );
}
