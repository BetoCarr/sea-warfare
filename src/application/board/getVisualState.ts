
import { CellState } from "@/lib/utils/types";
import type { ShipType } from '@/lib/domain/ships/models/ShipType';
import { CellVisualState } from "./board-types";
import { BoardVariant } from "./useBoardViewModel";

export function getVisualState(params: {
        boardVariant: BoardVariant;
        cellState: CellState;
        shipType?: ShipType;
        isPreview: boolean;
        isActiveShip?: boolean;
        previewResult?: 'valid' | 'invalid';
        showShips: boolean;
    }): CellVisualState {

    const {
        boardVariant,
        cellState,
        shipType,
        isPreview,
        isActiveShip,
        previewResult,
        showShips,
    } = params;

    if (isPreview) {
        return previewResult === 'valid'
            ? 'preview-valid'
            : 'preview-invalid';
    }

    if (cellState === 'hit') return 'hit';
    if (cellState === 'miss') return 'miss';
    if (cellState === 'sunk') return 'sunk';

    if (boardVariant === 'enemy') {
        return 'water';
    }

    if (shipType && showShips && !isActiveShip) {
        return 'ship';
    }

    if (isActiveShip) {
        return 'water';
    }

    return 'water';
}