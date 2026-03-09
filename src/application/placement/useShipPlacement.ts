"use client";

import { useGameStore } from "@/lib/store/game-store";

export function useShipPlacement() {
    const preview = useGameStore(s => s.preview);
    const orientation = useGameStore(s => s.orientation);
    const selectedShipType = useGameStore(s => s.selectedShipType);
    const selectShip = useGameStore(s => s.selectShip);
    const previewPlacement = useGameStore(s => s.previewPlacement);
    const confirmShipPlacement = useGameStore(s => s.confirmShipPlacement);
    const toggleOrientation = useGameStore(s => s.toggleOrientation);
    const confirmFleetPlacement = useGameStore(s => s.confirmFleetPlacement);
    const removePlayerShip = useGameStore(s => s.removePlayerShip);

    return {
        preview,
        orientation,
        selectedShipType,
        selectShip,
        previewPlacement,
        confirmShipPlacement,
        toggleOrientation,
        confirmFleetPlacement,
        removePlayerShip
    };
}