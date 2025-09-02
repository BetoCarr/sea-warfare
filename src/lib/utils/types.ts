// Represents the current state of a cell on the board
export type CellState = 'empty' | 'ship' | 'hit' | 'miss' | 'sunk';

// Ship categories/types
export type ShipType = 'carrier' | 'battleship' | 'cruiser' | 'submarine' | 'destroyer';

// Orientation of a ship on the board
export type Orientation = 'horizontal' | 'vertical';

// Grid coordinates for cells or ship positions
export interface Position {
    row: number;  // Row index (0-based)
    col: number;  // Column index (0-based)
}

// Represents a ship in the game
export interface Ship {
    id: string;                // Unique identifier
    type: ShipType;            // Ship type
    size: number;              // Number of cells the ship occupies
    position?: Position;       // Top-left position on the board (optional until placed)
    orientation: Orientation;  // Horizontal or vertical
    hits: boolean[];           // Array tracking which segments are hit
    isSunk: boolean;           // True if the ship is completely sunk
}