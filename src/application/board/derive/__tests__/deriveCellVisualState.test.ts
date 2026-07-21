import type { LogicalCellInfo } from '../deriveLogicalCellInfo';
import { deriveCellVisualState } from '../deriveCellVisualState';

function createLogicalCellInfo(state: LogicalCellInfo['state']): LogicalCellInfo {
    return { state };
}

describe('deriveCellVisualState', () => {
    it('gives preview states highest priority even when other cell data suggests a ship', () => {
        const result = deriveCellVisualState({
            boardVariant: 'enemy',
            logicalCell: createLogicalCellInfo('ship'),
            isPreview: true,
            isActiveShip: true,
            previewResult: 'valid',
            showShips: false,
        });

        expect(result).toBe('preview-valid');
    });

    it('returns preview-invalid when preview is present and the preview result is invalid', () => {
        const result = deriveCellVisualState({
            boardVariant: 'player',
            logicalCell: createLogicalCellInfo('ship'),
            isPreview: true,
            isActiveShip: false,
            previewResult: 'invalid',
            showShips: true,
        });

        expect(result).toBe('preview-invalid');
    });

    it('treats an undefined preview result as an invalid preview', () => {
        const result = deriveCellVisualState({
            boardVariant: 'player',
            logicalCell: createLogicalCellInfo('ship'),
            isPreview: true,
            isActiveShip: false,
            previewResult: undefined,
            showShips: true,
        });

        expect(result).toBe('preview-invalid');
    });

    it('never shows ships on enemy boards', () => {
        const result = deriveCellVisualState({
            boardVariant: 'enemy',
            logicalCell: createLogicalCellInfo('ship'),
            isPreview: false,
            showShips: true,
        });

        expect(result).toBe('water');
    });

    it('treats active ships as water', () => {
        const result = deriveCellVisualState({
            boardVariant: 'player',
            logicalCell: createLogicalCellInfo('ship'),
            isPreview: false,
            isActiveShip: true,
            showShips: true,
        });

        expect(result).toBe('water');
    });

    it('shows ships on the player board when ships are visible', () => {
        const result = deriveCellVisualState({
            boardVariant: 'player',
            logicalCell: createLogicalCellInfo('ship'),
            isPreview: false,
            showShips: true,
        });

        expect(result).toBe('ship');
    });

    it('does not render ships when showShips is disabled', () => {
        const result = deriveCellVisualState({
            boardVariant: 'player',
            logicalCell: createLogicalCellInfo('ship'),
            isPreview: false,
            showShips: false,
        });

        expect(result).toBe('water');
    });

    it('keeps water cells as water when showShips is disabled', () => {
        const result = deriveCellVisualState({
            boardVariant: 'player',
            logicalCell: createLogicalCellInfo('water'),
            isPreview: false,
            showShips: false,
        });

        expect(result).toBe('water');
    });

    it('keeps water cells as water', () => {
        const result = deriveCellVisualState({
            boardVariant: 'player',
            logicalCell: createLogicalCellInfo('water'),
            isPreview: false,
            showShips: true,
        });

        expect(result).toBe('water');
    });
});
