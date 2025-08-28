export type CellState = 'empty' | 'ship' | 'hit' | 'miss' | 'sunk';
export type ShipType = 'carrier' | 'battleship' | 'cruiser' | 'submarine' | 'destroyer';
export type Orientation = 'horizontal' | 'vertical';

export interface Position {
    row: number;
    col: number;
}

export interface Ship {
    id: string;
    type: ShipType;
    size: number;
    position?: Position;
    orientation: Orientation;
    hits: boolean[];
    isSunk: boolean;                // opcional, true si el barco fue hundido
}