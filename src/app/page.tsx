'use client';

import { useState } from 'react';
import Board from '@/components/game/Board';
import type { CellState, Position, Ship } from '@/lib/utils/types';

export default function Home() {
  const SIZE = 8;

  // Inicializar tablero vacío
  const [cells, setCells] = useState<CellState[][]>(
    Array.from({ length: SIZE }, () => Array(SIZE).fill('empty'))
  );

  // Ejemplo de barcos (opcional)
  const ships: Ship[] = [
    { id: 's1', position: { row: 0, col: 1 }, size: 2, orientation: 'horizontal' },
    { id: 's2', position: { row: 2, col: 2 }, size: 3, orientation: 'vertical' },
  ];

  // Manejar click en celda
  const handleCellClick = (row: number, col: number) => {
    setCells(prev => {
      const newCells = prev.map(r => [...r]);
      const states: CellState[] = ['empty', 'ship', 'hit', 'miss', 'sunk'];
      const currentIndex = states.indexOf(newCells[row][col]);
      const nextIndex = (currentIndex + 1) % states.length;
      newCells[row][col] = states[nextIndex];
      return newCells;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">Board & Cell Demo</h1>

      <Board
        size={SIZE}
        cells={cells}
        isPlayerBoard={true}
        ships={ships}
        onCellClick={handleCellClick}
        // title="Player Board Demo"
      />
    </div>
  );
}
