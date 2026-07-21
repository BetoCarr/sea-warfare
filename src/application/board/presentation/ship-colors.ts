import type { ShipType } from "@/lib/domain/ships/models/ShipType";

export const SHIP_COLORS: Record<ShipType, string> = {
    carrier: "bg-cyan-600 border-cyan-400 hover:bg-cyan-500",
    battleship: "bg-indigo-500 border-indigo-300 hover:bg-indigo-400",
    cruiser: "bg-violet-500 border-violet-300 hover:bg-violet-400",
    submarine: "bg-amber-500 border-amber-300 hover:bg-amber-400",
    destroyer: "bg-rose-500 border-rose-300 hover:bg-rose-400",
};