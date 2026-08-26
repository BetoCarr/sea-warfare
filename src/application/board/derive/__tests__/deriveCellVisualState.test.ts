import { deriveCellVisualState } from '../deriveCellVisualState';
import type { LogicalCellInfo } from '../deriveLogicalCellInfo';

function createLogicalCellInfo(state: LogicalCellInfo['state']): LogicalCellInfo {
    return { state };
}

describe('deriveCellVisualState', () => {
    it('treats enemy cells as water before evaluating preview state', () => {
        const result = deriveCellVisualState({
            boardVariant: 'enemy',
            logicalCell: createLogicalCellInfo('ship'),
            isPreview: true,
            previewResult: 'valid',
            isActiveShip: true,
            showShips: false,
        });

        expect(result).toBe('water');
    });

    it('returns preview-invalid when preview is present and the preview result is invalid', () => {
        const result = deriveCellVisualState({
            boardVariant: 'player',
            logicalCell: createLogicalCellInfo('ship'),
            isPreview: true,
            previewResult: 'invalid',
            isActiveShip: false,
            showShips: true,
        });

        expect(result).toBe('preview-invalid');
    });

    it('treats an undefined preview result as an invalid preview', () => {
        const result = deriveCellVisualState({
            boardVariant: 'player',
            logicalCell: createLogicalCellInfo('ship'),
            isPreview: true,
            previewResult: undefined,
            isActiveShip: false,
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
