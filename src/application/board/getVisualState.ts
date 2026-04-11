
import { CellState } from "@/lib/utils/types";
import { CellVisualState } from "./board-types";

export function getVisualState(params: {
        currentState: CellState;
        hasShip: boolean;
        isPreview: boolean;
        previewResult?: 'valid' | 'invalid';
        isGhost: boolean;
        showShips: boolean;
    }): CellVisualState {

    const {
        currentState,
        hasShip,
        isPreview,
        previewResult,
        isGhost,
        showShips,
    } = params;

    // 1. Preview
    if (isPreview) {
        return previewResult === 'valid'
            ? 'preview-valid'
            : 'preview-invalid';
    }

    // 2. Ghost (dragging existing ship)
    if (isGhost) {
        return 'preview-invalid'; // o crea 'ghost' si quieres diferenciar
    }

    // 3. Estados finales del juego
    if (currentState === 'hit') return 'hit';
    if (currentState === 'miss') return 'miss';
    if (currentState === 'sunk') return 'sunk';

    // 4. Ship visible
    if (hasShip && showShips) {
        return 'ship';
    }

    // 5. Default
    return 'water';
}