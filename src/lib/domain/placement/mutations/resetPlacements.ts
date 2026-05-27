/**
 * Clears authoritative placement state.
 * Pure: always returns an empty placements array.
 */
import type { ShipPlacement } from '../models/ShipPlacement';

export function resetPlacements(): ShipPlacement[] {
	return [];
}
