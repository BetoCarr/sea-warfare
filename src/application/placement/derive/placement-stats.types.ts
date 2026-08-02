import type { ShipType } from '@/lib/domain/ships/models/ShipType';

export type PlacementStats = {
    remainingShips: number;
    remainingShipTypes: ShipType[];
};