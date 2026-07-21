import type { CellVisualState } from '../board-types';

import type { LogicalCellInfo } from '../derive/deriveLogicalCellInfo';

import type { BoardVariant } from '../useBoardViewModel';

export function deriveCellVisualState(params: {
    boardVariant: BoardVariant;
    logicalCell: LogicalCellInfo;
    isPreview: boolean;
    isActiveShip?: boolean;
    previewResult?: 'valid' | 'invalid';
    showShips: boolean;
}): CellVisualState {

    const {
        boardVariant,
        logicalCell,
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

    if (boardVariant === 'enemy') {
        return 'water';
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