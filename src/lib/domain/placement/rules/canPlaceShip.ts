import type { BaseShip } from '@/lib/domain/ships/models/BaseShip';
import type { Position } from '@/lib/domain/shared/models/Position';
import type { Orientation } from '../models/Orientation';
import type { ShipPlacement } from '../models/ShipPlacement';
import { getShipCoordinates } from './getShipCoordinates';
import { shipsOverlap } from './shipsOverlap';

export type CanPlaceShipParams = {
    boardSize: number;
    ship: BaseShip;
    origin: Position;
    orientation: Orientation;
    existingShips: ShipPlacement[];
};

/**
 * High-level placement validation rule that composes smaller validation rules.
 * 
 * Pure function that:
 * - Validates board bounds
 * - Validates overlap with existing ships
 * - Returns true only if all validations pass
 * - Has no side effects
 * 
 * Validation responsibilities:
 * - Ensures origin is within board bounds
 * - Ensures ship coordinates stay within board bounds
 * - Ensures no overlap with existing ships
 */
export function canPlaceShip(
    params: CanPlaceShipParams,
): boolean {
    const { boardSize, ship, origin, orientation, existingShips } = params;

    // Derive the coordinates this ship would occupy
    const shipCoordinates = getShipCoordinates({
        origin,
        size: ship.size,
        orientation,
    });

    // Validate all coordinates stay within board bounds
    if (!areCoordinatesWithinBounds(shipCoordinates, boardSize)) {
        return false;
    }

    // Validate no overlap with existing ships
    if (hasPlacementCollision(shipCoordinates, existingShips)) {
        return false;
    }

    return true;
}

/**
 * Pure validation rule: All coordinates are within board bounds.
 */
function areCoordinatesWithinBounds(
    coordinates: Position[],
    boardSize: number,
): boolean {
    for (const pos of coordinates) {
        if (
            pos.row < 0 ||
            pos.row >= boardSize ||
            pos.col < 0 ||
            pos.col >= boardSize
        ) {
            return false;
        }
    }
    return true;
}

/**
 * Pure validation rule: No overlap with existing ships.
 */
function hasPlacementCollision(
    shipCoordinates: Position[],
    existingShips: ShipPlacement[],
): boolean {
    for (const existingPlacement of existingShips) {
        const existingCoordinates = getShipCoordinates({
            origin: existingPlacement.origin,
            size: existingPlacement.ship.size,
            orientation: existingPlacement.orientation,
        });

        if (
            shipsOverlap({
                shipA: shipCoordinates,
                shipB: existingCoordinates,
            })
        ) {
            return true;
        }
    }
    return false;
}