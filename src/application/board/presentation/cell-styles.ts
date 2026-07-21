import{ CellVisualState } from "../board-types";

export const CELL_STYLES: Record<CellVisualState, string> = {
    water:
        "bg-slate-700 border-slate-500 hover:bg-slate-600",

    ship:
        "text-white",

    "preview-valid":
        "bg-emerald-500/50 border-emerald-400",

    "preview-invalid":
        "bg-red-500/40 border-red-400",
};