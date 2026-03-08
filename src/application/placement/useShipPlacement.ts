"use client";

import { useCallback } from "react";
import { useGameStore } from "@/lib/store/game-store";
import { ShipPlacementInfo } from "@/lib/utils/types";
import type { PlacementIntent } from "@/lib/game-logic/placement/placement-types";

export function useShipPlacement() {

    const {
        placePlayerShip,
        removePlayerShip,
        selectShip,
        orientation
    } = useGameStore();

    /**
     * Commit definitivo de un placement válido
     */
    const placeShip = useCallback((intent: PlacementIntent) => {

        const placementInfo: ShipPlacementInfo = {
            type: intent.ship.type,
            size: intent.ship.size,
            position: intent.position,
            orientation: intent.orientation,
        };  

        return placePlayerShip(placementInfo);

    }, [placePlayerShip]);

    const removeShip = useCallback((shipId: string) => {
        removePlayerShip(shipId);
    }, [removePlayerShip]);

    return {
        placeShip,
        removeShip,
        selectShip,
        orientation
    };
}
