import { useCallback, useState } from "react";
import { usePlacementPreview } from "../usePlacementPreview";
import { useShipPlacement } from "../useShipPlacement";
import type { PlacementIntent } from "@/lib/game-logic/placement/placement-types";
import type { ShipSpec } from "@/lib/game-logic/ships/ship-spec";
import type { Position, Orientation } from "@/lib/utils/types";

type UIState = "idle" | "ship-selected" | "previewing";

export function useShipPlacementMobileBridge() {
    const { preview, previewAt, clearPreview } = usePlacementPreview();
    const { placeShip } = useShipPlacement();

    const [uiState, setUIState] = useState<UIState>("idle");
    const [selectedShip, setSelectedShip] = useState<ShipSpec | null>(null);
    const [orientation, setOrientation] = useState<Orientation>("horizontal");

    const selectShip = useCallback((ship: ShipSpec) => {
        setSelectedShip(ship);
        setUIState("ship-selected");
    }, []);

  const rotate = useCallback(() => {
    setOrientation(o => o === "horizontal" ? "vertical" : "horizontal");
    if (preview) {
      previewAt({
        ...preview.intent,
        orientation: orientation === "horizontal" ? "vertical" : "horizontal",
      });
    }
  }, [preview, previewAt, orientation]);

  const tapCell = useCallback((position: Position) => {
    if (!selectedShip) return;

    const intent: PlacementIntent = {
      ship: selectedShip,
      position,
      orientation,
    };

    const result = previewAt(intent);

    if (result.result === "invalid") {
      navigator.vibrate?.(50);
      clearPreview();
      setUIState("ship-selected");
      return;
    }

    setUIState("previewing");
  }, [selectedShip, orientation, previewAt, clearPreview]);

  const confirm = useCallback(() => {
    if (!preview || preview.result !== "valid") return;

    placeShip(preview.intent);
    clearPreview();
    setSelectedShip(null);
    setUIState("idle");
  }, [preview, placeShip, clearPreview]);

  return {
    uiState,
    preview,
    orientation,
    selectedShipId: selectedShip?.id ?? null,
    selectShip,
    tapCell,
    rotate,
    confirm,
  };
}
