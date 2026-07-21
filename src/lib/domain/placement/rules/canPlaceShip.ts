import { getShipCoordinates } from './getShipCoordinates';

import { shipsOverlap } from './shipsOverlap';



import type { Orientation } from '../models/Orientation';

import type { PlacementValidationResult } from '../models/PlacementValidationError';

import type { ShipPlacement } from '../models/ShipPlacement';

import type { Position } from '@/lib/domain/shared/models/Position';

import type { BaseShip } from '@/lib/domain/ships/models/BaseShip';

export type CanPlaceShipParams = {
    boardSize: number;
    ship: BaseShip;
    origin: Position;
    orientation: Orientation;
    existingPlacements: ShipPlacement[];
};

/**
 * High-level placement validation rule.
 *
 * Composes the individual placement rules into a single domain decision.
 * Returns either a successful validation or the reason the placement is invalid.
 */
export function canPlaceShip(
    params: CanPlaceShipParams,
): PlacementValidationResult {
    const { boardSize, ship, origin, orientation, existingPlacements } = params;

    const shipCoordinates = getShipCoordinates({
        origin,
        size: ship.size,
        orientation,
    });

    if (!areCoordinatesWithinBounds(shipCoordinates, boardSize)) {
        return { valid: false, error: 'OUT_OF_BOUNDS' };
    }

    if (hasPlacementCollision(shipCoordinates, existingPlacements)) {
        return { valid: false, error: 'OVERLAP' };
    }

    return { valid: true };
}

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

function hasPlacementCollision(
    shipCoordinates: Position[],
    existingPlacements: ShipPlacement[],
): boolean {
    for (const existingPlacement of existingPlacements) {
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