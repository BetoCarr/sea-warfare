import type { ShipType } from '@/lib/domain/ships/models/ShipType';

export type CellVisualState =
    | 'water'
    | 'ship'
    | 'preview-valid'
    | 'preview-invalid';

export interface CellPresentation {
    visualState: CellVisualState;

    className: string;

    content: string;

    ariaLabel: string;

    title: string;
}

export interface BoardCellVM {
    row: number;
    col: number;
    shipType?: ShipType;
    presentation: CellPresentation;
}

export interface BoardViewModel {
    size: number;
    cells: BoardCellVM[][];
}





















// ShipPlacement
//         │
//         ▼
// deriveLogicalCellInfo()
//         │
//         ▼
// LogicalCellInfo
//         │
//         ▼
// getVisualState()
//         │
//         ▼
// CellVisualState
//         │
//         ▼
// deriveCellPresentation()
//         │
//         ▼
// CellPresentation
//         │
//         ▼
// BoardCellVM
//         │
//         ▼
// Cell
