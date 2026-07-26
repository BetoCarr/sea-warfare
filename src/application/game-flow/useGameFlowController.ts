import { STANDARD_FLEET } from "@/lib/domain/ships/models/StandardFleet";

import { deriveCapabilities } from "./deriveCapabilities";

import { derivePresentation } from "./derivePresentation";

import { derivePlacementState } from "../placement/derive/derivePlacementState";

import { useGameplayStore } from "@/lib/store/gameplay-store";

export function useGameFlowController() {
    const game = useGameplayStore(state => state.game);
    const playerPlacements = useGameplayStore(state => state.playerPlacements);
    
    const placementState = derivePlacementState({
        placements: playerPlacements,
        requiredFleetSize: STANDARD_FLEET.length,
    });


    const capabilities = deriveCapabilities(game, placementState);
    const presentation = derivePresentation(game);

    return {
        capabilities,
        presentation,
    };
}