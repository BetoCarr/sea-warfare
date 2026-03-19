import type { Ship } from "@/lib/utils/types";
import { BOARD_SIZE } from '@/lib/utils/constants';
import { createFleet } from "../ships/ship-catalog";
import { canPlaceShipAt } from "../ships/ship-placement";
import { getValidPlacements } from "../ships/ship-validation";
import { createShipFromPlacement } from "../ships/ship-entity";
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

    for (const baseShip of fleet) {
        const validPlacements = getValidPlacements(baseShip, boardSize, placedShips);

        if (validPlacements.length === 0) {
            console.warn(`[AI] ⚠️ No valid placements for ship: ${baseShip.type}`);
            continue;
        }

        // Pick a random placement
        const randomIndex = Math.floor(Math.random() * validPlacements.length);
        const { position, orientation } = validPlacements[randomIndex];
        
        const isValid = canPlaceShipAt(
            baseShip,
            position,
            orientation,
            boardSize,
            placedShips
        );

        if (!isValid) {
            console.warn(`[AI] ❌ Invalid placement after selection for: ${baseShip.type}`);
            continue;
        }

        const placement = {
            ...baseShip,
            position,
            orientation
        }

        const ship = createShipFromPlacement(placement);
        
        placedShips.push(ship);
    }

    return placedShips;
}