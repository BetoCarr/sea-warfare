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

export interface BaseShip {
    id: string;
    type: ShipType;
    size: number;
}

// Interface for placement logic (decoupled from game state)
export interface ShipPlacementInfo extends BaseShip {
    position: Position;
    orientation: Orientation;
}

// Represents a ship in the game
export interface Ship extends ShipPlacementInfo {
    hits: boolean[];           // Array tracking which segments are hit
    isSunk: boolean;           // True if the ship is completely sunk
}