import { CellState } from "@/lib/utils/types";

// BoardCellVM representa el estado FINAL de celda que la UI necesita
export type BoardCellVM = {
    row: number;
    col: number;

    // estado visual final
    state: CellState;

    // flags visuales (UI only)
    isHovered: boolean;
    isGhost: boolean; // Reviasr si se puede eliminar o reutilizar isPreview
    isPreview: boolean;
};

export interface BoardViewModel {
    size: number;
    cells: BoardCellVM[][];
}