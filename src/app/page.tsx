"use client";

import { useEffect } from "react";
import { useGameStore } from "@/lib/stores/game-store";
import { createShip } from "@/lib/game-logic/ships/ship-factory";

export default function Page() {
  const { initializeGame, placePlayerShip, removePlayerShip } = useGameStore();

  useEffect(() => {
    console.clear();
    console.log("🧩 Testing Player Ship Removal...");

    // Paso 1️⃣: Inicializar el juego
    initializeGame();

    setTimeout(() => {
      // Paso 2️⃣: Crear y colocar un barco manualmente
      const cruiser = createShip("cruiser");
      cruiser.position = { row: 4, col: 2 };
      cruiser.orientation = "horizontal";

      console.log("⚙️ Trying to place:", cruiser);
      const placementResult = placePlayerShip(cruiser);
      console.log("📜 Placement Result:", placementResult);

      // Paso 3️⃣: Verificar estado actual del jugador
      const stateBefore = useGameStore.getState();
      console.log("🧍 Ships before removal:", stateBefore.player.ships.length);

      // Paso 4️⃣: Eliminar el barco recién colocado
      const removeResult = removePlayerShip(cruiser.id);
      console.log("🗑️ Remove Result:", removeResult);

      // Paso 5️⃣: Revisar el estado actualizado
      const stateAfter = useGameStore.getState();
      console.log("🧭 Remaining ships after removal:", stateAfter.player.ships.length);
      console.log("🧩 Player board after removal:", stateAfter.player.boardState.board);

    }, 400); // Pequeño delay para permitir initializeGame + AI init
  }, []);

  return (
    <main className="p-4">
      <h1 className="text-xl font-bold">Testing Ship Removal</h1>
      <p>Check console for output 🚀</p>
    </main>
  );
}
