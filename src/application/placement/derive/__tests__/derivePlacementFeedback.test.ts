import { derivePlacementFeedback } from '../derivePlacementFeedback';

describe('derivePlacementFeedback', () => {
    it('returns null when there is no mutation result', () => {
        const feedback = derivePlacementFeedback({
            mutationResult: null,
        });

        expect(feedback).toBeNull();
    });

    it('returns an overlap message when the mutation fails due to overlap', () => {
        const feedback = derivePlacementFeedback({
            mutationResult: {
                success: false,
                error: 'OVERLAP',
            },
        });

        expect(feedback).toBe('The ship overlaps another ship.');
    });

    it('returns an out of bounds message when the mutation fails due to out of bounds', () => {
        const feedback = derivePlacementFeedback({
            mutationResult: {
                success: false,
                error: 'OUT_OF_BOUNDS',
            },
        });

        expect(feedback).toBe('The ship does not fit on the board.');
    });

    it('returns ship placed feedback when the mutation succeeds with placed outcome', () => {
        const feedback = derivePlacementFeedback({
            mutationResult: {
                success: true,
                placements: [],
                outcome: 'placed',
            },
        });

        expect(feedback).toBe('Ship placed successfully.');
    });

    it('returns ship repositioned feedback when the mutation succeeds with repositioned outcome', () => {
        const feedback = derivePlacementFeedback({
            mutationResult: {
                success: true,
                placements: [],
                outcome: 'repositioned',
            },
        });

        expect(feedback).toBe('Ship repositioned successfully.');
    });
});