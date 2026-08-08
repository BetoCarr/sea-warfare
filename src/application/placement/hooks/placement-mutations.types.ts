import type { PlacementOutcome } from '@/lib/domain/placement/models/PlacementOutcome';



export type PlacementMutations = {
    placeShip: () => PlacementOutcome | null;

    confirmFleet: () => void;
};