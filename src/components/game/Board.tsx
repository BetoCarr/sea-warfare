'use client';

import Cell from './Cell';
import type { CellState ,Ship, Position } from '@/lib/utils/types';

interface BoardProps {
    size?: number;
    cells: CellState[][];
    isPlayerBoard: boolean;
    onCellClick: (row: number, col: number) => void;
    ships?: Ship[];
    showShips?: boolean; // opcional para debug
}

export default function Board({
    size = 10,
    cells,
    isPlayerBoard,
    onCellClick,
    ships = [],
    showShips = false,
}: BoardProps) {

    const shouldShowShips = isPlayerBoard || showShips;

    // Función simple para saber si hay un barco en la celda
    const hasShip = (row: number, col: number) => {
        return ships.some(ship => {
            if (!ship.position) return false;

            const { row: r, col: c } = ship.position;
            if (ship.orientation === 'horizontal') {
                return row === r && col >= c && col < c + ship.size;
            } else {
                return col === c && row >= r && row < r + ship.size;
            }
        });
    };

    return (
        <div className="inline-block bg-white p-4 border rounded shadow">
            {cells.map((rowCells, rowIndex) => (
                <div key={rowIndex} className="flex">
                    {rowCells.map((cellState, colIndex) => (
                        <Cell
                            key={`${rowIndex}-${colIndex}`}
                            state={cellState === 'ship' && shouldShowShips ? 'ship' : cellState}
                            position={{ row: rowIndex, col: colIndex }}
                            onClick={() => onCellClick(rowIndex, colIndex)}
                            showShip={shouldShowShips}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}
