"use client";

import { useGameStore } from "@/lib/stores/game-store";
export default function GameControls() {
  const initializeGame = useGameStore((state) => state.initializeGame);
  const resetGame = useGameStore((state) => state.resetGame);
  const confirmPlacement = useGameStore((state) => state.confirmPlacement);
  return (
    <div>
      <button onClick={() => initializeGame({ boardSize: 12 })}>
        Initialize Game
      </button>
      <button onClick={resetGame}>Reset Game</button>
      <button onClick={confirmPlacement}>RconfirmPlacement</button>

    </div>
  );
}
