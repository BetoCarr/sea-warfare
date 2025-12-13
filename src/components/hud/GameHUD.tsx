"use client";

import { useState, useRef } from "react";
import { useGameStore } from "@/lib/store/game-store";
import { GamePhase } from "@/lib/store/game-types";
import { useShallow } from "zustand/react/shallow";
import { PhaseSection } from "./PhaseSection";
import { TurnSection } from "./TurnSection";
import { ShipsRemainingSection } from "./ShipsRemainingSection";
import { BoardStats } from "./BoardStats";
import { ReadinessIndicators } from "./ReadinessIndicators";
// import { FeedbackMessage } from "./FeedbackMessage";
// import { StartBattleButton } from "./StartBattleButton";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function GameHUD() {
  const [feedback, setFeedback] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const { phase, playerReady, aiReady, confirmPlacement } = useGameStore(
    useShallow((state) => ({
      phase: state.phase,
      playerReady: state.player.isReady,
      aiReady: state.ai.isReady,
      confirmPlacement: state.confirmPlacement,
    }))
  );

  const handleConfirm = () => {
    const result = confirmPlacement();
    console.log("[UI] confirmPlacement result:", result);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setFeedback(
      result.success
        ? "Battle started! 🎮"
        : result.message || "Cannot start game"
    );
    timeoutRef.current = window.setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <Card className="w-full md:w-64 bg-slate-900 text-white p-4 rounded-lg flex flex-col gap-4 border border-slate-700 shadow-lg">
      <h2 className="text-xl font-bold border-b border-slate-700 pb-2">
        🎮 Game Info
      </h2>
      <PhaseSection />
      <TurnSection />
      <ShipsRemainingSection />
      <BoardStats />
      <ReadinessIndicators />
      {/* Feedback Message */}
      {feedback && (
        <div className="text-sm p-2 rounded bg-slate-800 text-center border border-slate-600">
          {feedback}
        </div>
      )}
      {/* Start Battle Button */}
      {phase === GamePhase.PLACEMENT && (
        <Button
          variant="primary"
          disabled={!playerReady || !aiReady}
          className="mt-auto"
        >
          {/* {getButtonLabel(playerReady, aiReady)} */}
        </Button>
      )}
    </Card>
  );
}
