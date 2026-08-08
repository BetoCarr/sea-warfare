import { PlacementContract } from './placement-contract.types';

export function createPlacementContract(
    params: PlacementContract,
): PlacementContract {
    return {
        capabilities: params.capabilities,
        instruction: params.instruction,
        feedback: params.feedback,
        stats: params.stats,
    };
}