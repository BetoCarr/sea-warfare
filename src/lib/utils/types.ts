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

// Interface for placement logic (decoupled from game state)
export interface ShipPlacementInfo {
    id: string;               // Unique identifier (for overlap checks)
    size: number;             // Length of the ship
    position?: Position;      // Current position
    orientation: Orientation; // Current orientation
}

// Represents a ship in the game
export interface Ship extends ShipPlacementInfo {
    type: ShipType;            // Ship type
    hits: boolean[];           // Array tracking which segments are hit
    isSunk: boolean;           // True if the ship is completely sunk
}