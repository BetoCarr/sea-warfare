import { useGameStore } from "@/lib/store/game-store";
import { useState, useCallback } from "react";
import { previewPlacement } from "../../lib/game-logic/placement/placement-preview";
import type { PlacementIntent, PlacementPreview } from "../../lib/game-logic/placement/placement-types";

export function usePlacementPreview() {
    const boardSize = useGameStore(s => s.config.boardSize);
    const playerShips = useGameStore(s => s.player.ships);

    const [preview, setPreview] = useState<PlacementPreview | null>(null);

    const previewAt = useCallback((intent: PlacementIntent) => {
        const result = previewPlacement(intent, boardSize, playerShips);
        setPreview(result);
        return result;
    }, [boardSize, playerShips]);

    const clearPreview = useCallback(() => {
        setPreview(null);
    }, []);

    return {
        preview,
        previewAt,
        clearPreview
    };
}
