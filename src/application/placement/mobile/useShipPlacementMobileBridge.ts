import { useCallback, useState } from "react";
import { useShipPlacement } from "../useShipPlacement";
import type { Position, ShipType } from "@/lib/utils/types";

type UIState = "idle" | "ship-selected" | "previewing";

export function useShipPlacementMobileBridge() {
  const {
    preview,
    previewPlacement,
    confirmPlacement,
    toggleOrientation,
    orientation,
    selectShip
  } = useShipPlacement();

  const [uiState, setUIState] = useState<UIState>("idle");
  const [selectedShip, setSelectedShip] = useState<ShipType | null>(null);

  const handleSelectShip = useCallback((ship: ShipType) => {
    setSelectedShip(ship);
    selectShip(ship);
    setUIState("ship-selected");
  }, [selectShip]);

  const tapCell = useCallback((position: Position) => {
    if (!selectedShip) return;

    previewPlacement(position);
    setUIState("previewing");

  }, [selectedShip, previewPlacement]);

  const confirm = useCallback(() => {
    if (!preview) return;

    confirmPlacement();

    setSelectedShip(null);
    setUIState("idle");

  }, [preview, confirmPlacement]);

  return {
    uiState,
    preview,
    orientation,
    selectedShip,
    handleSelectShip,
    tapCell,
    toggleOrientation,
    confirm
  };
}