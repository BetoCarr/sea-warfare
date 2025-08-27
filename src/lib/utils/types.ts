export type CellState = 'empty' | 'ship' | 'hit' | 'miss' | 'sunk';

export interface Position {
    row: number;
    col: number;
}

export interface Ship {
    id: string;
    position: Position;               // celda inicial
    orientation: 'horizontal' | 'vertical';
    size: number;                     // longitud
    isSunk?: boolean;                 // opcional, true si el barco fue hundido
}