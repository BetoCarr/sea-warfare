import { CELL_CONTENT } from "../presentation/cell-content";

import { CELL_STYLES } from "../presentation/cell-styles";

import { SHIP_COLORS } from "../presentation/ship-colors";



import type { CellPresentation, CellVisualState } from "../board-types";

import type { Position } from "@/lib/domain/shared/models/Position";

import type { ShipType } from "@/lib/domain/ships/models/ShipType";

export function deriveCellPresentation(
    position: Position,
    visualState: CellVisualState,
    shipType?: ShipType,
): CellPresentation {

    const coord =
        `${String.fromCharCode(65 + position.col)}${position.row + 1}`;

    const className =
        visualState === "ship"
            ? `${CELL_STYLES.ship} ${SHIP_COLORS[shipType ?? "carrier"]}`
            : CELL_STYLES[visualState];

    return {
        visualState,

        className,

        content: CELL_CONTENT[visualState],

        ariaLabel: `Cell ${coord}: ${visualState}`,

        title: coord,
    };
}