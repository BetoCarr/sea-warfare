import type { Position } from '@/lib/domain/shared/models/Position';
import type { ShipPlacement } from '../../../lib/domain/placement/models/ShipPlacement';

// Agregar la función deriveOccupiedCells a la documentacion y crear tests para esta función. Esta función toma un array de ShipPlacement y devuelve un array de Position que representa las celdas ocupadas por los barcos colocados. La función itera sobre cada ShipPlacement y, dependiendo de su orientación (horizontal o vertical), calcula las posiciones de las celdas ocupadas por el barco y las agrega a la lista de celdas ocupadas.
export function deriveOccupiedCells(
    placements: ShipPlacement[],
): Position[] {

    const cells: Position[] = [];

    for (const placement of placements) {

        for (
            let offset = 0;
            offset < placement.ship.size;
            offset++
        ) {

            cells.push({
                row:
                    placement.origin.row +
                    (
                        placement.orientation === 'vertical'
                            ? offset
                            : 0
                    ),

                col:
                    placement.origin.col +
                    (
                        placement.orientation === 'horizontal'
                            ? offset
                            : 0
                    ),
            });
        }
    }

    return cells;
}