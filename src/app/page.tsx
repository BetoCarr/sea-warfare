"use client";

import { useState } from "react";
import { useGameStore } from "@/lib/stores/game-store";

export default function GameControls() {
  const initializeGame = useGameStore((state) => state.initializeGame);
  const startGame = useGameStore((state) => state.startGame);
  const resetGame = useGameStore((state) => state.resetGame);
  const phase = useGameStore((state) => state.phase);
  const status = useGameStore((state) => state.status);
  const player = useGameStore((state) => state.player);
  const ai = useGameStore((state) => state.ai);

  const [result, setResult] = useState<string>("");

  const handleStartGame = () => {
    const actionResult = startGame();
    console.log("[TEST] Result:", actionResult);
    setResult(`${actionResult.success ? "✅" : "❌"} ${actionResult.message}`);
  };
  const handleForceReady = () => {
    useGameStore.setState((state) => ({
      player: { ...state.player, isReady: true, ships: [{ id: "s1" }] },
      ai: { ...state.ai, isReady: true, ships: [{ id: "a1" }] },
    }));
    console.log("[TEST] Forced ready state");
  };

  return (
    <div style={{ padding: 20, fontFamily: "monospace" }}>
      <h1>🧪 Game Store Test</h1>

      <div style={{ marginBottom: 10 }}>
        <button onClick={() => initializeGame({ boardSize: 12 })}>
          🟢 Initialize Game
        </button>
        <button onClick={handleStartGame}>🚀 Start Game</button>
        <button onClick={resetGame}>🔄 Reset Game</button>
        <button onClick={handleForceReady}>⚙️ Force Ready State</button>

      </div>

      <div style={{ marginTop: 20 }}>
        <h3>📋 Store state:</h3>
        <pre>
          Phase: {phase}{"\n"}
          Status: {status}{"\n"}
          Player ready: {String(player.isReady)}{"\n"}
          AI ready: {String(ai.isReady)}{"\n"}
          Player ships: {player.ships.length}{"\n"}
          AI ships: {ai.ships.length}
        </pre>
      </div>

      {result && (
        <div style={{ marginTop: 10, color: result.startsWith("✅") ? "green" : "red" }}>
          {result}
        </div>
      )}
    </div>
  );
}
