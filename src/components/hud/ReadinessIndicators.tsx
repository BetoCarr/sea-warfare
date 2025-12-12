"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Section } from "@/components/ui/layout/Section";
import { FlexRow } from "@/components/ui/layout/FlexRow";

import { GamePhase } from "@/lib/store/game-types";
import { useGameStore } from "@/lib/store/game-store";
import { useShallow } from "zustand/react/shallow";

export const ReadinessIndicators: React.FC = () => {
  const { phase, playerReady, aiReady } = useGameStore(
    useShallow((state) => ({
      phase: state.phase,
      playerReady: state.player.isReady,
      aiReady: state.ai.isReady,
    }))
  );

  if (phase !== GamePhase.PLACEMENT) return null;

  return (
    <Card className="flex flex-col gap-2">
      <Section title="Readiness">
        <FlexRow className="gap-4 text-sm">
          <FlexRow>
            <Badge
              className={playerReady ? "text-green-400" : "text-yellow-400"}
            >
              {playerReady ? "✓" : "○"}
            </Badge>
            <span className="text-slate-300">Player Ready</span>
          </FlexRow>
          <FlexRow>
            <Badge className={aiReady ? "text-green-400" : "text-yellow-400"}>
              {aiReady ? "✓" : "○"}
            </Badge>
            <span className="text-slate-300">AI Ready</span>
          </FlexRow>
        </FlexRow>
      </Section>
    </Card>
  );
};
