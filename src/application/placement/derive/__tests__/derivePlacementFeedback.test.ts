import { derivePlacementFeedback } from '../derivePlacementFeedback';

describe('derivePlacementFeedback', () => {
    it('returns invalid placement feedback for invalid preview', () => {
        const feedback = derivePlacementFeedback({
            preview: {
                cells: [{ row: 0, col: 0 }],
                isValid: false,
                validationError: 'OVERLAP',
            },
            outcome: null,
        });

        expect(feedback).toEqual({
            message: 'Invalid placement',
            validationError: 'OVERLAP',
        });
    });

    it('returns placed feedback for a placed outcome', () => {
        const feedback = derivePlacementFeedback({
            preview: {
                cells: [{ row: 0, col: 0 }],
                isValid: true,
            },
            outcome: 'placed',
        });

        expect(feedback).toEqual({ message: 'Ship placed successfully' });
    });

    it('returns repositioned feedback for a repositioned outcome', () => {
        const feedback = derivePlacementFeedback({
            preview: {
                cells: [{ row: 0, col: 0 }],
                isValid: true,
            },
            outcome: 'repositioned',
        });

        expect(feedback).toEqual({ message: 'Ship repositioned' });
    });
});
