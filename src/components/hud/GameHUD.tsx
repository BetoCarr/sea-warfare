import { useRef, useState, useEffect } from "react";
import { useGameStore } from "@/lib/store/game-store";
import { GamePhase } from "@/lib/store/game-types";
import { useShallow } from "zustand/react/shallow";
import { ShipPalette } from "../game/ShipPalette";
import { OrientationToggle } from "@/components/game/OrientationToggle";
import { BoardStats } from "./BoardStats";
import { PhaseSection } from "./PhaseSection";
import { ReadinessIndicators } from "./ReadinessIndicators";
import { ShipsRemainingSection } from "./ShipsRemainingSection";
import { TurnSection } from "./TurnSection";
import { FeedbackMessage, FeedbackType } from "./FeedbackMessage";
import { Button } from "@/components/ui/Button";

interface GameHUDProps {
  onInitialize?: () => void;
}

export function GameHUD({ onInitialize }: GameHUDProps) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('info');
  const timeoutRef = useRef<number | null>(null);

  const { phase, playerReady, aiReady, confirmPlacement, currentTurn } = useGameStore(
    useShallow((state) => ({
      phase: state.phase,
      playerReady: state.player.isReady,
      aiReady: state.ai.isReady,
      confirmPlacement: state.confirmPlacement,
      currentTurn: state.currentTurn,
    }))
  );

  const handleConfirm = () => {
    const result = confirmPlacement();
    console.log("[UI] confirmPlacement result:", result);
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    setFeedback(result.message || (result.success ? "Battle started! 🎮" : "Cannot start game"));
    setFeedbackType(result.success ? 'success' : 'error');
    
    // Auto-clear success messages, keep errors longer
    timeoutRef.current = window.setTimeout(() => setFeedback(null), result.success ? 3000 : 5000);
  };

  // --- Feedback Effect for AI Attacks ---
  const { lastAttack } = useGameStore(useShallow(s => ({ lastAttack: s.lastAttack })));

  /*
   * useEffect to react to new attacks.
   * If AI attacked, show feedback. 
   */
  useEffect(() => {
    if (lastAttack && lastAttack.by === 'ai') {
        const msgs = {
            'hit': "AI Hit your ship! 💥",
            'sunk': "AI Sunk your ship! 💀",
            'miss': "AI Missed... 🌊",
            'invalid': ""
        };
        const msg = msgs[lastAttack.type];
        if (msg) {
            setFeedback(msg);
            setFeedbackType(lastAttack.type === 'miss' ? 'info' : 'error'); // Hit/Sunk is bad for player -> error/warning style? Or just info/success inverse? 
            // In FeedbackMessage: 'error' is red, 'success' is green. 
            // AI Hit is bad for player (Red). AI Miss is good (Green... or Neutral).
            // Let's use 'error' for HIT/SUNK (Danger), 'info' for MISS.
            
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = window.setTimeout(() => setFeedback(null), 3000);
        }
    }
  }, [lastAttack]);

  // --- Instructions Logic ---
  const instruction = (() => {
    switch (phase) {
      case GamePhase.SETUP:
        return "Initialize system to begin...";
      case GamePhase.PLACEMENT:
        if (playerReady && aiReady) return "Systems Ready! Initialize Combat Sequence 🚀";
        return "Drag ships to grid ↔️ tap 'R' to rotate";
      case GamePhase.BATTLE:
        return (currentTurn === 'player') 
          ? "Select target coordinates to fire! 🎯" 
          : "Incoming enemy transmission... ⚠️";
      case GamePhase.GAME_OVER:
        return "Game Over - System Needs Reset";
      default:
        return null;
    }
  })();

  const activeMessage = feedback || instruction;
  const activeType = feedback ? feedbackType : 'instruction';

  return (
    <header className="w-full h-34 px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-white bg-slate-800 border-b border-slate-700 transition-all duration-300 shadow-sm z-20 relative">
      {/* LEFT: Branding & Phase */}
      <div className="flex items-center gap-6 self-start md:self-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚓</span>
          <h1 className="font-bold text-xl tracking-tight hidden lg:block text-slate-100">SEA WARFARE</h1>
        </div>
        <div className="h-8 w-px bg-slate-600 hidden md:block" />
        <PhaseSection />
        {phase === GamePhase.SETUP && (
          <Button variant="primary" onClick={onInitialize} className="ml-4 py-1 px-3 text-sm animate-cta-pulse">
            Initialize System
          </Button>
        )}
      </div>

      {/* CENTER: Turn or Placement Controls */}
      <div className="flex-1 flex flex-wrap items-center justify-center gap-4 w-full md:w-auto">
        {phase === GamePhase.BATTLE && (
          <TurnSection />
        )}
        {phase === GamePhase.PLACEMENT && (
          <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto p-2">
            <ShipPalette />
            <div className="h-px w-full md:w-px md:h-12 bg-slate-600" />
            <div className="flex items-center gap-4">
                <OrientationToggle />
                <ReadinessIndicators />
                <Button
                variant="primary"
                disabled={!playerReady || !aiReady}
                onClick={handleConfirm}
                className={`whitespace-nowrap ${playerReady && aiReady ? 'animate-cta-pulse ring-2 ring-sky-400 ring-offset-2 ring-offset-slate-900' : ''}`}
                >
                Start Battle
                </Button>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT: Stats */}
      <div className="flex items-center gap-4 self-end md:self-auto">
        {phase === GamePhase.BATTLE && (
          <>
            <ShipsRemainingSection />
            <div className="h-8 w-px bg-slate-600 hidden md:block" />
            <BoardStats />
          </>
        )}
      </div>

      {/* Feedback Message (fixed position) */}
      <FeedbackMessage 
        message={activeMessage} 
        type={activeType} 
        onDismiss={() => setFeedback(null)}
        className="absolute top-full left-1/2 -translate-x-1/2 z-[100] mt-4 shadow-xl whitespace-nowrap"
      />
    </header>
  );
}
