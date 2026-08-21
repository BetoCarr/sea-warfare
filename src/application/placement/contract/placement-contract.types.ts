import type { PlacementCapabilities } from '../derive/placement-capabilites.types';
import type { PlacementInstruction } from '../derive/placement-instruction.types';
import type { PlacementStats } from '../derive/placement-stats.types';

export type PlacementContract = {
    capabilities: PlacementCapabilities;
    instruction: PlacementInstruction;
    feedback: string | null;
    stats: PlacementStats;
};