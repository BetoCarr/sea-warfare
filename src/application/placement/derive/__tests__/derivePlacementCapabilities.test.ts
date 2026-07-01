import { derivePlacementCapabilities } from '../derivePlacementCapabilities';
import { PlacementState } from '@/lib/domain/placement/models/PlacementState';

describe('derivePlacementCapabilities', () => {
    it('enables ship placement and board interaction while placing ships', () => {
        expect(derivePlacementCapabilities(PlacementState.PLACING_SHIPS)).toEqual({
            canPlaceShip: true,
            canConfirmFleet: false,
            canInteractWithBoard: true,
        });
    });

    it('enables fleet confirmation and board interaction when fleet is ready', () => {
        expect(derivePlacementCapabilities(PlacementState.FLEET_READY)).toEqual({
            canPlaceShip: false,
            canConfirmFleet: true,
            canInteractWithBoard: true,
        });
    });

    it('is deterministic for identical placement states', () => {
        const first = derivePlacementCapabilities(PlacementState.FLEET_READY);
        const second = derivePlacementCapabilities(PlacementState.FLEET_READY);

        expect(first).toEqual(second);
    });
});
