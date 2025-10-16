// "use client";

// import { useState } from "react";
// import { useGameStore } from "@/lib/stores/game-store";

// export default function GameControls() {
//   const initializeGame = useGameStore((state) => state.initializeGame);
//   const startGame = useGameStore((state) => state.startGame);
//   const resetGame = useGameStore((state) => state.resetGame);
//   const _initializeAI = useGameStore((state) => state._initializeAI); // ⚠️ Solo para test

//   const phase = useGameStore((state) => state.phase);
//   const status = useGameStore((state) => state.status);
//   const player = useGameStore((state) => state.player);
//   const ai = useGameStore((state) => state.ai);

//   const [result, setResult] = useState<string>("");

//   const handleStartGame = () => {
//     const actionResult = startGame();
//     console.log("[TEST] Result:", actionResult);
//     setResult(`${actionResult.success ? "✅" : "❌"} ${actionResult.message}`);
//   };
//   const handleForceReady = () => {
//     useGameStore.setState((state) => ({
//       player: { ...state.player, isReady: true, ships: [{ id: "s1" }] },
//       ai: { ...state.ai, isReady: true, ships: [{ id: "a1" }] },
//     }));
//     console.log("[TEST] Forced ready state");
//   };
//   const handleTestAI = () => {
//       console.clear();
//       console.log("🧪 Testing AI Initialization...");
//       _initializeAI();
//       setTimeout(() => {
//           const state = useGameStore.getState(); // ✅ leer snapshot actualizado
//           console.log("🤖 AI Ships:", state.ai.ships);
//           console.log("📊 Board Snapshot:", state.ai.boardState?.board);
//       }, 300); // pequeño delay para permitir setState
//     };
//   return (
//     <div style={{ padding: 20, fontFamily: "monospace" }}>
//       <h1>🧪 Game Store Test</h1>

//       <div style={{ marginBottom: 10 }}>
//         <button onClick={() => initializeGame({ boardSize: 12 })}>
//           🟢 Initialize Game
//         </button>
//         <button onClick={handleStartGame}>🚀 Start Game</button>
//         <button onClick={resetGame}>🔄 Reset Game</button>
//         <button onClick={handleForceReady}>⚙️ Force Ready State</button>
//         <button onClick={handleTestAI}>Test Initialize AI 🤖</button>
//       </div>

//       <div style={{ marginTop: 20 }}>
//         <h3>📋 Store state:</h3>
//         <pre>
//           Phase: {phase}{"\n"}
//           Status: {status}{"\n"}
//           Player ready: {String(player.isReady)}{"\n"}
//           AI ready: {String(ai.isReady)}{"\n"}
//           Player ships: {player.ships.length}{"\n"}
//           AI ships: {ai.ships.length}
//         </pre>
//       </div>

//       {result && (
//         <div style={{ marginTop: 10, color: result.startsWith("✅") ? "green" : "red" }}>
//           {result}
//         </div>
//       )}
//     </div>
//   );
// }
"use client";

import { useEffect } from "react";
import { useGameStore } from "@/lib/stores/game-store";
import { createShip } from "@/lib/game-logic/ships/ship-factory";

export default function Page() {
  const { initializeGame, placePlayerShip, player } = useGameStore();

  useEffect(() => {
    console.clear();
    console.log("🧩 Testing Player Ship Placement...");

    // Paso 1: Inicializar juego
    initializeGame();

    setTimeout(() => {
      // Paso 2: Crear un barco manualmente
      const destroyer = createShip("destroyer");
      destroyer.position = { row: 2, col: 3 };
      destroyer.orientation = "horizontal";

      console.log("⚙️ Trying to place:", destroyer);

      // Paso 3: Llamar al store
      const result = placePlayerShip(destroyer);

      console.log("📜 Placement Result:", result);
      const state = useGameStore.getState(); // ✅ leer snapshot actualizado

      console.log("🧍 Player Ships:", state.player.ships);
      console.log("🧭 Board Snapshot:", state.player.boardState.board);
    }, 300);
  }, []);

  return (
    <main className="p-4">
      <h1 className="text-xl font-bold">Testing Player Ship Placement</h1>
      <p>Check console for output 🚀</p>
    </main>
  );
}
