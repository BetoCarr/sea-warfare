import type { ShipPlacement } from '@/lib/domain/placement/models/ShipPlacement';
import type { PlacementInteractionsContract } from '@/application/placement/hooks/placement-interactions-contract.types';
import type { PlacementPreview } from '@/application/placement/derive/placement-preview.types';
import type { PlacementContract } from '@/application/placement/contract/placement-contract.types';


export interface PlacementController {
    playerPlacements: ShipPlacement[];
    interaction: PlacementInteractionsContract;
    preview: PlacementPreview | null;
    contract: PlacementContract;
}