import { useGameStore } from "@/lib/store/game-store";
import { deriveCapabilities } from "./deriveCapabilities";

export function useGameFlowController() {
    const phase = useGameStore(state => state.phase);
    const status = useGameStore(state => state.status);

    const capabilities = deriveCapabilities(
        phase,
        status,
    );

    return {
        capabilities,
    };
}