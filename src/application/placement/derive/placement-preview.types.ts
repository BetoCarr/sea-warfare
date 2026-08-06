import type { PlacementValidationError } from '../../../lib/domain/placement/models/PlacementValidationError';

import type { Position} from '../../../lib/domain/shared/models/Position';

export type PlacementPreview =
    | {
        isValid: true;
        cells: Position[];
    }
    | {
        isValid: false;
        cells: Position[];
        validationError: PlacementValidationError;
    };