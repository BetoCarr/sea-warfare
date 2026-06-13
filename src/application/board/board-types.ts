export interface BoardCellVM {
    row: number;
    col: number;
    visualState: CellVisualState;
    isHovered: boolean; // Revisar isHovered debe ser derivado de hoveredCell en lugar de ser parte del VM
}

export interface BoardViewModel {
    size: number;
    cells: BoardCellVM[][];
}

export type CellVisualState =
    | 'water' 
    | 'ship'
    | 'hit'
    | 'miss'
    | 'sunk'
    | 'preview-valid'
    | 'preview-invalid';