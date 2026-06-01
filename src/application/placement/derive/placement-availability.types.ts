import type { ShipType } from '@/lib/domain/ships/models/ShipType';

export type PlacementAvailability = {
    remainingShipTypes: ShipType[];
    allShipsPlaced: boolean;
};