import type { PlacementValidationError } from '../../../lib/domain/placement/models/PlacementValidationError';

import type { Position} from '../../../lib/domain/shared/models/Position';

export type PlacementPreview = {
    cells: Position[];
    isValid: boolean;
    validationError?: PlacementValidationError;
};