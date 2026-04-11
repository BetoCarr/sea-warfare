export interface BoardCellVM {
    row: number;
    col: number;
    visualState: CellVisualState;
    isHovered: boolean;
}

export interface BoardViewModel {
    size: number;
    cells: BoardCellVM[][];
}

export type CellVisualState =
    | 'water' // Revisar water o emty en el flujo
    | 'ship'
    | 'hit'
    | 'miss'
    | 'sunk'
    | 'preview-valid'
    | 'preview-invalid';