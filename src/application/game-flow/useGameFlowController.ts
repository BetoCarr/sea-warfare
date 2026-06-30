// import { useGameStore } from "@/lib/store/game-store";
import { useGameplayStore } from "@/lib/store/gameplay/gameplay-store";
import { deriveCapabilities } from "./deriveCapabilities";
import { derivePresentation } from "./derivePresentation";

export function useGameFlowController() {
    
    // const phase = useGameStore(state => state.phase);
    // const status = useGameStore(state => state.status);

    const game = useGameplayStore(state => state.game);

    // const capabilities = deriveCapabilities(
    //     phase,
    //     status,
    // );

    // const presentation = derivePresentation(
    //     phase,
    //     status,
    // );

    const capabilities = deriveCapabilities(game);
    const presentation = derivePresentation(game);

    return {
        capabilities,
        presentation,
    };
}