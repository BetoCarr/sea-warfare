
import { CellState } from "@/lib/utils/types";
import { CellVisualState } from "./board-types";
import { BoardVariant } from "./useBoardViewModel";

export function getVisualState(params: {
        boardVariant: BoardVariant;
        currentState: CellState;
        hasShip: boolean;
        isPreview: boolean;
        previewResult?: 'valid' | 'invalid';
        isGhost: boolean;
        showShips: boolean;
    }): CellVisualState {

    const {
        boardVariant,
        currentState,
        hasShip,
        isPreview,
        previewResult,
        isGhost,
        showShips,
    } = params;

    // Board enemy visual logic is simpler: solo muestra agua, impactos y fallos (y eventualmente barcos hundidos)
    if (boardVariant === 'enemy') {

        if (currentState === 'empty') {
            return 'water';
        }

        if (currentState === 'hit') {
            return 'hit';
        }
    }

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