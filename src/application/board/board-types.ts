import type { ShipType } from '@/lib/domain/ships/models/ShipType';

export interface BoardCellVM {
    row: number;
    col: number;
    shipType?: ShipType;
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