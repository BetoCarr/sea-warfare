
import { usePlacement } from "@/application/placement/hooks/usePlacement";

import { deriveCapabilities } from "./deriveCapabilities";

import { derivePresentation } from "./derivePresentation";


import { useGameplayStore } from "@/lib/store/gameplay-store";

export function useGameFlowController() {
    
    const game = useGameplayStore(state => state.game);
    const placement = usePlacement();


    const capabilities = deriveCapabilities(game, placement.contract.capabilities);
    const presentation = derivePresentation(game);

    return {
        capabilities,
        presentation,
    };
}