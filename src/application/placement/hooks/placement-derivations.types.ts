import type { PlacementCapabilities } from '../derive/placement-capabilites.types';
import type { PlacementFeedback } from '../derive/placement-feedback.types';
import type { PlacementInstruction } from '../derive/placement-instruction.types';
import type { PlacementPreview } from '../derive/placement-preview.types';
import type { PlacementStats } from '../derive/placement-stats.types';

export type PlacementDerivations = {

    stats: PlacementStats;
    capabilities: PlacementCapabilities;

    preview: PlacementPreview | null;
    instruction: PlacementInstruction;
    feedback: PlacementFeedback | null;

};