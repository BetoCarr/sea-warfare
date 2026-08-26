import type { CellVisualState } from '../board-types';
import type { LogicalCellInfo } from '../derive/deriveLogicalCellInfo';
import type { BoardVariant } from '../useBoardViewModel';

export function deriveCellVisualState(params: {
    boardVariant: BoardVariant;
    logicalCell: LogicalCellInfo;
    isPreview: boolean;
    previewResult?: 'valid' | 'invalid';
    isActiveShip?: boolean;
    showShips: boolean;
}): CellVisualState {

    const {
        boardVariant,
        logicalCell,
        isPreview,
        previewResult,
        isActiveShip,
        showShips,
    } = params;

    if (boardVariant === 'enemy') {
        return 'water';
    }

    if (isPreview) {
        return previewResult === 'valid'
            ? 'preview-valid'
            : 'preview-invalid';
    }

    if (isActiveShip) {
        return 'water';
    }

    if (
        logicalCell.state === 'ship' &&
        showShips
    ) {
        return 'ship';
    }

    return 'water';
}