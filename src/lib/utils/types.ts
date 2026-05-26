import { BaseShip} from '../domain/ships/models/BaseShip';
import { Position } from '../domain/shared/models/Position';
import { Orientation } from '../domain/placement/models/Orientation';

// Represents the current state of a cell on the board
export type CellState = 'empty' | 'ship' | 'hit' | 'miss' | 'sunk';

// Interface for placement logic (decoupled from game state)
export interface ShipPlacementInfo extends BaseShip {
    position: Position;
    orientation: Orientation;
}

// Represents a ship in the game
export interface Ship extends ShipPlacementInfo {
    id: string;
    hits: boolean[];           // Array tracking which segments are hit
    isSunk: boolean;           // True if the ship is completely sunk
}