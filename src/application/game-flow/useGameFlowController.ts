
import { deriveCapabilities } from "./deriveCapabilities";

import { derivePresentation } from "./derivePresentation";


import { useGameplayStore } from "@/lib/store/gameplay-store";

import type { PlacementCapabilities } from '@/application/placement/derive/placement-capabilites.types';
import type { GameFlowController } from "@/application/game-flow/game-flow-types";

interface UseGameFlowControllerProps {
    placementCapabilities: PlacementCapabilities;
}

export function useGameFlowController({
    placementCapabilities,
}: UseGameFlowControllerProps): GameFlowController {
    const game = useGameplayStore(state => state.game);

    const capabilities = deriveCapabilities(game, placementCapabilities);
    const presentation = derivePresentation(game);

    return {
        capabilities,
        presentation,
    };
}