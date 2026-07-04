import type { Position} from '../../../lib/domain/shared/models/Position';
import type { PlacementValidationError } from '../../../lib/domain/placement/models/PlacementValidationError';

export type PlacementPreview = {
    cells: Position[];
    isValid: boolean;
    validationError?: PlacementValidationError;
};