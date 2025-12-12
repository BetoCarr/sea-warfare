"use client";

import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/layout/Section";
import { Panel } from "@/components/ui/layout/Panel";
import { StatRow } from "@/components/ui/layout/StatRow";

interface BoardStatsProps {
  playerHits: number;
  playerMisses: number;
  aiHits: number;
  aiMisses: number;
}

export const BoardStats: React.FC<BoardStatsProps> = ({
  playerHits,
  playerMisses,
  aiHits,
  aiMisses,
}) => (
  <Card className="flex flex-col gap-2">
    <Section title="Board Stats">
      <Panel>
        {/* Player Board */}
        <StatRow
          label={
            <span className="text-sm font-semibold text-green-400">
              Player Board
            </span>
          }
          value=""
        />
        <StatRow
          label="Hits"
          value={<span className="font-bold">{playerHits}</span>}
          labelClass="text-green-400"
        />
        <StatRow
          label="Misses"
          value={<span className="font-bold">{playerMisses}</span>}
          labelClass="text-green-400"
        />
        {/* AI Board */}
        <StatRow
          label={
            <span className="text-sm font-semibold text-orange-400">
              AI Board
            </span>
          }
          value=""
        />
        <StatRow
          label="Hits"
          value={<span className="font-bold">{aiHits}</span>}
          labelClass="text-orange-400"
        />
        <StatRow
          label="Misses"
          value={<span className="font-bold">{aiMisses}</span>}
          labelClass="text-orange-400"
        />
      </Panel>
    </Section>
  </Card>
);
