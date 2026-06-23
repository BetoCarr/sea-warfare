
import { CellState } from "@/lib/utils/types";
import { CellVisualState } from "./board-types";
import { BoardVariant } from "./useBoardViewModel";

export function getVisualState(params: {
        boardVariant: BoardVariant;
        currentState: CellState;
        hasShip: boolean;
        isPreview: boolean;
        isActiveShip?: boolean;
        previewResult?: 'valid' | 'invalid';
        showShips: boolean;
    }): CellVisualState {

    const {
        boardVariant,
        currentState,
        hasShip,
        isPreview,
        isActiveShip,
        previewResult,
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

    // 3. Estados finales del juego
    if (currentState === 'hit') return 'hit';
    if (currentState === 'miss') return 'miss';
    if (currentState === 'sunk') return 'sunk';

    if (hasShip && showShips && !isActiveShip) {
        return 'ship';
    }

    if (isActiveShip) {
        return 'water';
    }

    // 5. Default
    return 'water';
}