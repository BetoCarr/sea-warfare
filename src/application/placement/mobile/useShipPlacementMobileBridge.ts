import { useCallback, useState } from "react";
import { useShipPlacement } from "../useShipPlacement";
import type { Position, ShipType } from "@/lib/utils/types";

type UIState = "idle" | "ship-selected" | "previewing";

export function useShipPlacementMobileBridge() {
  const {
    preview,
    previewPlacement,
    confirmShipPlacement,
    toggleOrientation,
    orientation,
    selectShip,
    selectedShipType
  } = useShipPlacement();

  const [uiState, setUIState] = useState<UIState>("idle");

  const handleSelectShip = useCallback((ship: ShipType) => {
    selectShip(ship);
    setUIState("ship-selected");
  }, [selectShip]);

  const tapCell = useCallback((position: Position) => {
    if (!selectedShipType) return;

    previewPlacement(position);
    setUIState("previewing");

  }, [selectedShipType, previewPlacement]);

  const confirm = useCallback(() => {
    if (!preview) return;

    const result = confirmShipPlacement();

    if (!result.success) return;

    setUIState("idle");

  }, [preview, confirmShipPlacement]);

  return {
    uiState,
    preview,
    orientation,
    selectedShipType,
    handleSelectShip,
    tapCell,
    toggleOrientation,
    confirm
  };
}