import type { PlacementCapabilities } from '../derive/placement-capabilites.types';
import type { PlacementFeedback } from '../derive/placement-feedback.types';
import type { PlacementInstruction } from '../derive/placement-instruction.types';
import type { PlacementPreview } from '../derive/placement-preview.types';
import type { PlacementStats } from '../derive/placement-stats.types';

export type PlacementDerivations = {
    preview: PlacementPreview | null;

    capabilities: PlacementCapabilities;

    instruction: PlacementInstruction;

    feedback: PlacementFeedback | null;

    stats: PlacementStats;
};