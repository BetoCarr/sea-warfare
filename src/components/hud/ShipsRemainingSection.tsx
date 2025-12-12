"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Section } from "@/components/ui/layout/Section";
import { Panel } from "@/components/ui/layout/Panel";
import { StatRow } from "@/components/ui/layout/StatRow";
import { useGameStore } from "@/lib/store/game-store";
import { useShallow } from "zustand/react/shallow";

export function ShipsRemainingSection() {
  const { playerRemaining, aiRemaining } = useGameStore(
    useShallow((state) => ({
      playerRemaining: state.player.ships.filter((s) => !s.isSunk).length,
      aiRemaining: state.ai.ships.filter((s) => !s.isSunk).length,
    }))
  );

  return (
    <Card className="flex flex-col gap-2">
      <Section title="Ships Remaining">
        <Panel>
          <StatRow
            label={
              <Badge className="bg-slate-800 text-green-400">🧭 Player</Badge>
            }
            value={
              <Badge className="bg-slate-800 text-green-400 font-bold">
                {playerRemaining}
              </Badge>
            }
          />
          <StatRow
            label={
              <Badge className="bg-slate-800 text-orange-400">🤖 AI</Badge>
            }
            value={
              <Badge className="bg-slate-800 text-orange-400 font-bold">
                {aiRemaining}
              </Badge>
            }
          />
        </Panel>
      </Section>
    </Card>
  );
}
