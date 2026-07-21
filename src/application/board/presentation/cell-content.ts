import type { CellVisualState } from "../board-types";

export const CELL_CONTENT: Record<CellVisualState, string> = {
    water: "",
    ship: "",
    "preview-valid": "",
    "preview-invalid": "",
};