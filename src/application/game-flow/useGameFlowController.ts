import { useGameStore } from "@/lib/store/game-store";
import { deriveCapabilities } from "./deriveCapabilities";
import { derivePresentation } from "./derivePresentation";

export function useGameFlowController() {
    
    const phase = useGameStore(state => state.phase);
    const status = useGameStore(state => state.status);


    const capabilities = deriveCapabilities(
        phase,
        status,
    );

    const presentation = derivePresentation(
        phase,
        status,
    );

    return {
        capabilities,
        presentation,
    };
}