export interface BoardCellVM {
    row: number;
    col: number;
    // Possibly 
    // shipType?: ShipType;
    visualState: CellVisualState;
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