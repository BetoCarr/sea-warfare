import { useMemo } from 'react';
import type { BoardViewModel, BoardCellVM } from './board-types';
import type { CellState, Position } from '@/lib/utils/types';
import type { PlacementPreview } from '@/lib/game-logic/placement/placement-types';
import type { Ship } from '@/lib/utils/types';

interface UseBoardViewModelParams {
    size: number;
    cells: CellState[][];
    ships: Ship[];
    hoveredCell?: Position | null;
    preview?: PlacementPreview | null;
    draggingShipId?: string | null; // se debe usar shiptype ya que en fase placement no hay shipId aún
    showShips: boolean;
}

export function useBoardViewModel({
    size,
    cells,
    ships,
    hoveredCell,
    preview,
    draggingShipId,
    showShips,
}: UseBoardViewModelParams): BoardViewModel {

    const vm = useMemo(() => {

        const result: BoardCellVM[][] = [];

        for (let row = 0; row < size; row++) {
            const rowCells: BoardCellVM[] = [];

            for (let col = 0; col < size; col++) {

                // ⚠️ Fase 1: NO movemos lógica aún
                const currentState = cells[row]?.[col] || 'empty';

                // 🔴 Copia de getCellDisplayState (simplificada)
                let computedState: CellState = currentState;
                // console.log(computedState)
                // ⚠️ Aún NO usamos ships aquí completamente
                if (currentState === 'hit' || currentState === 'miss' || currentState === 'sunk') {
                    computedState = currentState;
                } else {
                    // Placeholder: luego conectaremos ships correctamente
                    if (showShips && currentState === 'ship') {
                        computedState = 'ship';
                    } else {
                        computedState = 'empty';
                    }
                }


                const isHovered =
                    hoveredCell?.row === row && hoveredCell?.col === col;

                const isPreview =
                    preview?.occupiedCells?.some(p => p.row === row && p.col === col) ?? false;

                const isGhost = false; // se moverá en fases posteriores

                rowCells.push({
                    row,
                    col,
                    state: computedState,
                    isHovered,
                    isGhost,
                    isPreview,
                });
            }

            result.push(rowCells);
        }

        return {
            size,
            cells: result,
        };

    }, [size, cells, hoveredCell, preview]);

    return vm;
}