"use client";

import { useGameStore } from "@/lib/store/game-store";

export function useShipPlacement() {
    const preview = useGameStore(s => s.preview);
    const orientation = useGameStore(s => s.orientation);
    const selectShip = useGameStore(s => s.selectShip);
    const previewPlacement = useGameStore(s => s.previewPlacement);
    const toggleOrientation = useGameStore(s => s.toggleOrientation);
    const confirmPlacement = useGameStore(s => s.confirmPlacement);
    const removePlayerShip = useGameStore(s => s.removePlayerShip);

    return {
        preview,
        orientation,
        selectShip,
        previewPlacement,
        toggleOrientation,
        confirmPlacement,
        removePlayerShip
    };
}