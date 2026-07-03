import { useGameplayStore } from "@/lib/store/gameplay/gameplay-store";
import { deriveCapabilities } from "./deriveCapabilities";
import { derivePresentation } from "./derivePresentation";

export function useGameFlowController() {
    const game = useGameplayStore(state => state.game);

    const capabilities = deriveCapabilities(game);
    const presentation = derivePresentation(game);

    return {
        capabilities,
        presentation,
    };
}