import { STANDARD_FLEET } from "@/lib/domain/ships/models/StandardFleet";

import { usePlacement } from "@/application/placement/hooks/usePlacement";

import { deriveCapabilities } from "./deriveCapabilities";

import { derivePresentation } from "./derivePresentation";

import { derivePlacementState } from "../placement/derive/derivePlacementState";

import { useGameplayStore } from "@/lib/store/gameplay-store";

export function useGameFlowController() {
    
    const game = useGameplayStore(state => state.game);
    const placement = usePlacement();

    // console.log("placement", placement);

    const capabilities = deriveCapabilities(game, placement.contract.capabilities);
    const presentation = derivePresentation(game);

    return {
        capabilities,
        presentation,
    };
}