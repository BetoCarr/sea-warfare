
import { useRef, useState, useEffect } from "react";
import { useGameStore } from "@/lib/store/game-store";
import { GamePhase } from "@/lib/store/game-types";
import { useShallow } from "zustand/react/shallow";
import { ReadinessIndicators } from "./ReadinessIndicators";
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
   * Handles visual feedback for both Player and AI attacks.
   */
  useEffect(() => {
    if (lastAttack) {
      let msg = "";
      let type: FeedbackType = 'info';

      if (lastAttack.by === 'ai') {
        // AI Attacking Player
        const msgs = {
          'hit': "AI Hit your ship! 💥",
          'sunk': "AI Sunk your ship! 💀",
          'miss': "AI Missed... 🌊",
          'invalid': ""
        };
        msg = msgs[lastAttack.type] || "";
        type = (lastAttack.type === 'hit' || lastAttack.type === 'sunk') ? 'error' : 'warning';
      } else {
        // Player Attacking AI
        const msgs = {
          'hit': "Direct Hit! 🎯",
          'sunk': "Enemy Ship Sunk! 🎆",
          'miss': "Missed target... 💨",
          'invalid': "Invalid Coordinates 🚫"
        };
        msg = msgs[lastAttack.type] || "";
        type = (lastAttack.type === 'hit' || lastAttack.type === 'sunk') ? 'success' : 'warning';
      }

      if (msg) {
        setFeedback(msg);
        setFeedbackType(type);
        
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
        return "";
      default:
        return null;
    }
  })();

  const activeMessage = feedback || instruction;
  const activeType = feedback ? feedbackType : 'instruction';

  // --- Dynamic Content Selectors ---
  const renderCenterContent = () => {
    switch (phase) {
        case GamePhase.PLACEMENT:
            return (
              <div className="hidden md:flex items-center gap-4">
                <span className="text-xs text-slate-400">Setup your fleet</span>
                <ReadinessIndicators />
              </div>
            );
        case GamePhase.BATTLE:
            return <TurnSection />;
        case GamePhase.GAME_OVER:
            return <span className="text-xs font-bold text-yellow-400">MATCH ENDED</span>;
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
                <span className="hidden sm:inline">START</span>
                <span className="sm:hidden">⚔️</span>
              </Button>
            );
        case GamePhase.PLACEMENT:
            return (
                <Button 
                  variant="success"
                  onClick={handleConfirm}
                  disabled={!playerReady || !aiReady}
                  pulse={playerReady && aiReady}
                >
                  <span className="sm:hidden">START</span>
                  <span className="hidden sm:inline">START BATTLE</span>
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
      [GamePhase.SETUP]: "SYSTEM BOOT",
      [GamePhase.PLACEMENT]: "DEPLOYMENT",
      [GamePhase.BATTLE]: "COMBAT",
      [GamePhase.GAME_OVER]: "DEBRIEF"
  }[phase];

  return (
    <header className="h-14 flex items-center justify-between px-3 md:px-6 border-b border-slate-700 bg-slate-800/80 backdrop-blur-md shadow-sm relative z-50">
      
      {/* LEFT: Identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚓</span>
          <span className="text-sm font-bold tracking-wider text-slate-100 hidden sm:block">
            SEA WARFARE
          </span>
        </div>
        <div className="h-4 w-px bg-slate-600 mx-1" />
        <span className="text-[10px] sm:text-xs font-mono text-cyan-400 bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-900/50">
          {phaseLabel}
        </span>
      </div>

      {/* CENTER: Dynamic Context (Hidden on very small screens if crowded) */}
      <div className="flex-1 flex justify-center mx-4">
        {renderCenterContent()}
      </div>

      {/* RIGHT: Primary Action */}
      <div>
        {renderAction()}
      </div>

      {/* Stats Overlay/HIdden handling: For now keeping it cleaner as requested. 
          Board stats could be integrated into the center or a sub-header if really needed, 
          but for h-14 we prioritize the main loop flow. 
      */}

      {/* Feedback Message Toast */}
      {/* <FeedbackMessage 
        message={activeMessage} 
        type={activeType} 
        onDismiss={() => setFeedback(null)}
        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 shadow-xl whitespace-nowrap text-sm"
      /> */}
    </header>
  );
}

