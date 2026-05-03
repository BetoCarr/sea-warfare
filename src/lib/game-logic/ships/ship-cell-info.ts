import { Ship, Position, Orientation } from "@/lib/utils/types";

export const getCellInfo = (row: number, col: number, ships: Ship[] ) => {
    const shipInCell = ships.find(ship => {
        if (!ship.position) return false;

        const { row: shipRow, col: shipCol } = ship.position;
        const { orientation, size: shipSize } = ship;
        if (orientation === 'horizontal') {
            return row === shipRow && col >= shipCol && col < shipCol + shipSize;
        } else {
            return col === shipCol && row >= shipRow && row < shipRow + shipSize;
        }
    });

    return {
        hasShip: !!shipInCell,
        ship: shipInCell,
        isShipStart:
        shipInCell?.position?.row === row &&
        shipInCell?.position?.col === col,
    };
};

export function getOccupiedCells(
    size: number,
    position: Position,
    orientation: Orientation
): Position[] {

    const cells: Position[] = [];

    for (let i = 0; i < size; i++) {
        cells.push({
            row: orientation === 'vertical'
                ? position.row + i
                : position.row,

            col: orientation === 'horizontal'
                ? position.col + i
                : position.col,
        });
    }

    return cells;
}

let celdas = getOccupiedCells(3, { row: 2, col: 3 }, 'horizontal');
let celdas2 = getOccupiedCells(4, { row: 1, col: 1 }, 'vertical');
console.log(celdas); 
console.log(celdas2); 