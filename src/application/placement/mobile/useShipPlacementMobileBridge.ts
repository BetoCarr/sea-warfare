import { useCallback, useState } from "react";
import { useShipPlacement } from "../useShipPlacement";
import type { Position, ShipType } from "@/lib/utils/types";

export function usePlacementMobileBridge() {
  const placement = useShipPlacement();

  const onShipTap = useCallback((ship: ShipType) => {
    placement.selectShip(ship);
  }, [placement]);

  const onBoardTap = useCallback((position: Position) => {
    if (!placement.selectedShipType) return;

    placement.previewPlacement(position);
  }, [placement]);

  const onConfirmTap = useCallback(() => {
    placement.confirmShipPlacement();
  }, [placement]);

  return {
    orientation: placement.orientation,
    selectedShipType: placement.selectedShipType,
    preview: placement.preview,

    onShipTap,
    onBoardTap,
    onConfirmTap,
    onRotateTap: placement.toggleOrientation,
  };
}