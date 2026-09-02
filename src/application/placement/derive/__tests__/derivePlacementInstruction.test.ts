import { derivePlacementInstruction } from '../derivePlacementInstruction';

describe('derivePlacementInstruction', () => {
    it('returns "Select ship" when no ship is selected', () => {
        expect(
            derivePlacementInstruction({
                selectedShipType: null,
                targetCell: null,
                canConfirmFleet: false,
            }),
        ).toBe('Select ship');
    });

    it('returns "Select position" when a ship is selected but no target cell exists', () => {
        expect(
            derivePlacementInstruction({
                selectedShipType: 'carrier',
                targetCell: null,
                canConfirmFleet: false, 
            }),
        ).toBe('Select position');
    });

    it('returns "Place ship" when a ship is selected and a target cell exists', () => {
        expect(
            derivePlacementInstruction({
                selectedShipType: 'carrier',
                targetCell: { row: 2, col: 3 },
                canConfirmFleet: false,
            }),
        ).toBe('Place ship');
    });

    it('should return confirm fleet when the fleet can be confirmed', () => {
        expect(
            derivePlacementInstruction({
                selectedShipType: null,
                targetCell: null,
                canConfirmFleet: true,
            }),
        ).toBe('Confirm fleet');
    });
});

