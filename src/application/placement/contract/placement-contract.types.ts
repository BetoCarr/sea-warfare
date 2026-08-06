import type { PlacementCapabilities } from '../derive/placement-capabilites.types';
import type { PlacementFeedback } from '../derive/placement-feedback.types';
import type { PlacementInstruction } from '../derive/placement-instruction.types';
import type { PlacementStats } from '../derive/placement-stats.types';

export type PlacementContract = {
    capabilities: PlacementCapabilities;
    instruction: PlacementInstruction;
    feedback: PlacementFeedback | null;
    stats: PlacementStats;
};