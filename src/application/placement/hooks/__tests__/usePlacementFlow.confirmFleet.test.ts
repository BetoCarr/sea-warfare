import { useGameplayStore } from '@/lib/store/gameplay/gameplay-store';
import { GamePhase } from '@/lib/domain/game/game-types';

import { executePlacementFlowAction } from '../testing/executePlacementFlowAction';
import { resetPlacementStores } from '../testing/resetPlacementStores';
import { placementGameState } from '../testing/placementGameState';
import { createCompleteFleetPlacements, createDestroyerPlacement } from '../testing/placement-test-data';

declare global {
    var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}

describe('usePlacementFlow confirmFleet', () => {
    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        resetPlacementStores();
    });

    it('transitions to battle phase when all ships are placed', () => {
        useGameplayStore.setState({
            ...placementGameState,
            playerPlacements: createCompleteFleetPlacements(),
        });

        executePlacementFlowAction(flow => {
            flow.confirmFleet();
        });

        expect(useGameplayStore.getState().phase).toBe(GamePhase.BATTLE);
    });

    it('does not transition when fleet is incomplete', () => {
        useGameplayStore.setState({
            ...placementGameState,
            playerPlacements: [createDestroyerPlacement()],
        });

        executePlacementFlowAction(flow => {
            flow.confirmFleet();
        });

        expect(useGameplayStore.getState().phase).toBe(GamePhase.PLACEMENT);
    });

    it('does not modify placements', () => {
        const placements = [
            createDestroyerPlacement(),
        ];

        useGameplayStore.setState({
            ...placementGameState,
            playerPlacements: placements,
        });

        executePlacementFlowAction(flow => {
            flow.confirmFleet();
        });

        expect(
            useGameplayStore.getState()
                .playerPlacements,
        ).toEqual(placements);
    });
});
