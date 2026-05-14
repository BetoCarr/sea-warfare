
import { useRef, useState, useEffect } from "react";
import { useGameStore } from "@/lib/store/game-store";
import { GamePhase } from "@/lib/domain/game/game-types";
import { useShallow } from "zustand/react/shallow";
import { ReadinessIndicators } from "./ReadinessIndicators";
import { TurnSection } from "./TurnSection";
import { FeedbackMessage, FeedbackType } from "./FeedbackMessage";
import { Button } from "@/components/ui/Button";

interface GameHUDProps {
  onInitialize?: () => void;
  onConfirm?: () => { success: boolean, message?: string };
}

export function GameHUD({ onInitialize, onConfirm }: GameHUDProps) {
  const { phase, playerReady, aiReady, currentTurn } = useGameStore(
    useShallow((state) => ({
      phase: state.phase,
      playerReady: state.player.isReady,
      aiReady: state.ai.isReady,
      currentTurn: state.currentTurn,
    }))
  );

  const handleConfirmAction = () => {
    if (onConfirm) {
        onConfirm();
    }
  };

  // --- Dynamic Content Selectors ---
  const renderCenterContent = () => {
    switch (phase) {
        case GamePhase.PLACEMENT:
            return (
              <div className="hidden md:flex items-center gap-4">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Fleet Setup</span>
                <ReadinessIndicators />
              </div>
            );
        case GamePhase.BATTLE:
            return <TurnSection />;
        case GamePhase.GAME_OVER:
            return <span className="text-xs font-bold text-yellow-400 tracking-[0.2em]">MATCH ENDED</span>;
        default:
            return null;
    }
  };

  const renderAction = () => {
    switch (phase) {
        case GamePhase.SETUP:
            return (
              <Button 
                variant="success"
                onClick={onInitialize}
                pulse={true}
              >
                <span className="hidden sm:inline">INITIALIZE SYSTEM</span>
                <span className="sm:hidden">START</span>
              </Button>
            );
        case GamePhase.PLACEMENT:
            return (
                <Button 
                  variant="success"
                  onClick={handleConfirmAction}
                  disabled={!playerReady || !aiReady}
                  pulse={playerReady && aiReady}
                >
                  <span className="sm:hidden">CONFIRM</span>
                  <span className="hidden sm:inline">CONFIRM FLEET</span>
                </Button>
            );
        case GamePhase.GAME_OVER:
            return (
              <Button 
                variant="secondary"
                onClick={() => window.location.reload()} 
              >
                REMATCH
              </Button>
            );
        default:
            return null;
    }
  };

  // Phase Display Name
  const phaseLabel = {
      [GamePhase.SETUP]: "BOOT",
      [GamePhase.PLACEMENT]: "DEPLOY",
      [GamePhase.BATTLE]: "COMBAT",
      [GamePhase.GAME_OVER]: "END"
  }[phase];

  return (
    <header className="h-14 flex-none flex items-center justify-between px-3 md:px-6 border-b border-slate-700/50 bg-slate-900 shadow-xl relative z-[60]">
      
      {/* LEFT: Identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-lg filter drop-shadow-sm">⚓</span>
          <span className="text-sm font-black tracking-tighter text-slate-100 hidden sm:block">
            SEA WARFARE
          </span>
        </div>
        <div className="h-4 w-px bg-slate-700 mx-1" />
        <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-500/20">
          {phaseLabel}
        </span>
      </div>

      {/* CENTER: Dynamic Context */}
      <div className="flex-1 flex justify-center mx-4">
        {renderCenterContent()}
      </div>

      {/* RIGHT: Primary Action */}
      <div className="min-w-[80px] flex justify-end">
        {renderAction()}
      </div>
    </header>
  );
}

