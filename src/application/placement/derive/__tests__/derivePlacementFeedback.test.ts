import { derivePlacementFeedback } from '../derivePlacementFeedback';

describe('derivePlacementFeedback', () => {
    it('returns null when there is no mutation result', () => {
        const feedback = derivePlacementFeedback({
            mutationResult: null,
        });

        expect(feedback).toBeNull();
    });

    it('returns invalid placement feedback when the mutation fails due to overlap', () => {
        const feedback = derivePlacementFeedback({
            mutationResult: {
                success: false,
                error: 'OVERLAP',
            },
        });

        expect(feedback).toEqual({
            type: 'invalid-placement',
            validationError: 'OVERLAP',
        });
    });

    it('returns invalid placement feedback when the mutation fails due to out of bounds', () => {
        const feedback = derivePlacementFeedback({
            mutationResult: {
                success: false,
                error: 'OUT_OF_BOUNDS',
            },
        });

        expect(feedback).toEqual({
            type: 'invalid-placement',
            validationError: 'OUT_OF_BOUNDS',
        });
    });

    it('returns ship placed feedback when the mutation succeeds with placed outcome', () => {
        const feedback = derivePlacementFeedback({
            mutationResult: {
                success: true,
                placements: [],
                outcome: 'placed',
            },
        });

        expect(feedback).toEqual({
            type: 'ship-placed',
        });
    });

    it('returns ship repositioned feedback when the mutation succeeds with repositioned outcome', () => {
        const feedback = derivePlacementFeedback({
            mutationResult: {
                success: true,
                placements: [],
                outcome: 'repositioned',
            },
        });

        expect(feedback).toEqual({
            type: 'ship-repositioned',
        });
    });
});