import type { Position } from '@/lib/domain/shared/models/Position';
import type { ShipPlacement } from '@/lib/domain/placement/models/ShipPlacement';
import type { ShipType } from '@/lib/domain/ships/models/ShipType';
import { getShipCoordinates } from '@/lib/domain/placement/rules/getShipCoordinates';

export interface LogicalCellInfo {
    state: LogicalCellState;
    shipType?: ShipType;
}


export type LogicalCellState =
    | 'water'
    | 'ship';

// Documentar
export function deriveLogicalCellInfo(
    position: Position,
    placements: ShipPlacement[],
): LogicalCellInfo {

    for (const placement of placements) {

        const occupiedCells = getShipCoordinates({
            origin: placement.origin,
            size: placement.ship.size,
            orientation: placement.orientation,
        });

        const occupiesCell = occupiedCells.some(
            coordinate =>
                coordinate.row === position.row &&
                coordinate.col === position.col,
        );

        if (occupiesCell) {
            return {
                state: 'ship',
                shipType: placement.ship.type,
            };
        }
    }

    return {
        state: 'water',
    };
}

























// Fase 3 — Reducir getVisualState()

// Aquí ocurre el cambio importante.

// Eliminar:

// cellState

// Como entrada.

// Ahora recibe:

// LogicalCellState

// preview

// selectedShipType

// showShips

// boardVariant

// Y únicamente decide representación visual.

// Toda la lógica:

// if (cellState === 'hit')

// Desaparece.

// Porque todavía no existe Battle.

// Fase 4 — Refactor de useBoardViewModel()

// Eliminar completamente:

// cells

// Del contrato.

// En el loop:

// Antes

// cells

// ↓

// cellState

// ↓

// getVisualState

// Después

// deriveLogicalCellState()

// ↓

// LogicalCellState

// ↓

// getVisualState()
// Fase 5 — Ajustar llamadas

// Actualizar todos los lugares donde se invoca.

// Antes

// cells: playerBoard

// Después

// Simplemente desaparece.

// La entrada queda únicamente con:

// playerPlacements

// preview

// selectedShipType

// showShips
// Fase 6 — Eliminar CellState

// Cuando todo compile.

// Eliminar:

// type CellState

// Eliminar cualquier helper relacionado.

// Eliminar cualquier import.

// Fase 7 — Revisar BoardVM

// Verificar que el pipeline quedó exactamente así.

// GameplayState

// ↓

// ShipPlacements

// ↓

// deriveLogicalCellState

// ↓

// getVisualState

// ↓

// BoardCellVM

// Si aparece un estado persistente intermedio...

// Todavía queda arquitectura vieja.

// Fase 8 — Commit

// Yo haría un commit independiente.

// refactor(board): derive BoardViewModel directly from gameplay state

// Porque este cambio merece quedar registrado como un hito.

// Resultado esperado

// Antes

// GameplayState

// ↓

// BoardState

// ↓

// CellState

// ↓

// BoardViewModel

// Después

// GameplayState

// ↓

// BoardViewModel

// Dos niveles completos desaparecen.