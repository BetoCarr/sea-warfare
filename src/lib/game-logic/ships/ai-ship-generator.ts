import type { Ship } from "@/lib/utils/types";
import { createFleet } from "./ship-factory";
import { placeShip } from './ship-placement';
import { getValidPlacements } from './ship-validation';
import { BOARD_SIZE } from '@/lib/utils/constants';

/**
 * RESPONSIBILITY: 🤖 AI FLEET GENERATION
 *
 * Generates a complete AI fleet with valid, random, non-overlapping positions.
 * 
 * - Reuses existing placement & validation logic
 * - Ensures all ships are within bounds and non-colliding
 * - Returns fully positioned ships ready for BoardState sync
 */

export function generateAIShips(boardSize: number = BOARD_SIZE): Ship[] {
    const fleet = createFleet();
    const placedShips: Ship[] = [];

    for (const ship of fleet) {
        const validPlacements = getValidPlacements(ship, boardSize, placedShips);

        if (validPlacements.length === 0) {
            console.warn(`[AI] ⚠️ No valid placements for ship: ${ship.type}`);
            continue;
        }

        // Pick a random placement
        const randomIndex = Math.floor(Math.random() * validPlacements.length);
        const { position, orientation } = validPlacements[randomIndex];

        // Place the ship and add to list
        const placedShip = placeShip(ship, position, orientation, boardSize, placedShips);
        placedShips.push(placedShip);
    }

    return placedShips;
}