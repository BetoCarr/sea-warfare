import { useRef, useState } from "react";
import { useGameStore } from "@/lib/store/game-store";
import { GamePhase } from "@/lib/store/game-types";
import { useShallow } from "zustand/react/shallow";
// import { ShipPalette } from "@/components/game/ShipPalette";
import { BoardStats } from "./BoardStats";
import { PhaseSection } from "./PhaseSection";
import { ReadinessIndicators } from "./ReadinessIndicators";
import { ShipsRemainingSection } from "./ShipsRemainingSection";
import { TurnSection } from "./TurnSection";
// import { FeedbackMessage } from "./FeedbackMessage";
// import { StartBattleButton } from "./StartBattleButton";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface GameHUDProps {
  onInitialize?: () => void;
}

export function GameHUD({ onInitialize }: GameHUDProps) {
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

      {/* SETUP PHASE: Initialize Game */}
      {phase === GamePhase.SETUP && (
        <>
          <Button variant="primary" onClick={onInitialize} className="mt-auto">
            Initialize Game
          </Button>
        </>
      )}

      {/* PLACEMENT PHASE: Ship Selection & Readiness */}
      {phase === GamePhase.PLACEMENT && (
        <>
          {/* <ShipPalette /> */}
          <ReadinessIndicators />
          <Button
            variant="primary"
            disabled={!playerReady || !aiReady}
            onClick={handleConfirm}
            className="mt-auto"
          >
            Start Battle
          </Button>
        </>
      )}

      {/* BATTLE PHASE: Stats & Turn Info */}
      {phase === GamePhase.BATTLE && (
        <>
          <TurnSection />
          <ShipsRemainingSection />
          <BoardStats />
        </>
      )}

      {/* Feedback Message */}
      {feedback && (
        <div className="text-sm p-2 rounded bg-slate-800 text-center border border-slate-600">
          {feedback}
        </div>
      )}
    </Card>
  );
}
