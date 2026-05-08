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
