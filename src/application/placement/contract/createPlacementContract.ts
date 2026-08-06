import type { PlacementCapabilities } from '../derive/placement-capabilites.types';
import type { PlacementFeedback } from '../derive/placement-feedback.types';
import type { PlacementInstruction } from '../derive/placement-instruction.types';
import type { PlacementStats } from '../derive/placement-stats.types';
import { PlacementContract } from './placement-contract.types';


type CreatePlacementContractParams = {
    capabilities: PlacementCapabilities;
    instruction: PlacementInstruction;
    feedback: PlacementFeedback | null;
    stats: PlacementStats;
};

export function createPlacementContract(
    params: CreatePlacementContractParams,
): PlacementContract {
    return {
        capabilities: params.capabilities,
        instruction: params.instruction,
        feedback: params.feedback,
        stats: params.stats,
    };
}