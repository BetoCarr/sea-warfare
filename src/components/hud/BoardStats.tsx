"use client";
import { useGameStore } from "@/lib/store/game-store";
import { useShallow } from "zustand/react/shallow";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/layout/Section";
import { Panel } from "@/components/ui/layout/Panel";
import { StatRow } from "@/components/ui/layout/StatRow";

/**
 * BoardStats displays hit/miss statistics for both player and AI boards.
 *
 * - Subscribes directly to the game store with a fine-grained selector.
 * - Re-renders only when hit/miss counts change.
 * - Avoids prop-drilling from GameHUD.
 * - Purely presentational: no game logic, only derived state.
 */
export function BoardStats() {
  /**
   * Select only the board statistics required for rendering.
   *
   * Using `useShallow` ensures the component only re-renders
   * when one of these numeric values actually changes.
   */
  const { playerHits, playerMisses, aiHits, aiMisses } = useGameStore(
    useShallow((state) => ({
      playerHits: state.player.boardState.hits.length,
      playerMisses: state.player.boardState.misses.length,
      aiHits: state.ai.boardState.hits.length,
      aiMisses: state.ai.boardState.misses.length,
    }))
  );

  return (
    <Card className="flex flex-col gap-2">
      <Section title="Board Stats">
        <Panel>
          {/* --- Player Board Stats --- */}
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

          {/* --- AI Board Stats --- */}
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
}
