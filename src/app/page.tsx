
'use client';

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
// import Ship from '@/components/Ship'; // tu componente Ship
import Ship from '@/components/game/Ship'; // tu componente Ship
import Cell from '@/components/game/Cell'; // tu componente Cell
// import { createFleet, placeShip, canPlaceShipAt, rotateShip, getShipCoordinates } from '@/lib/game-logic/ship';
import { createFleet } from '@/lib/game-logic/ships/ship-factory';
import { placeShip, canPlaceShipAt, rotateShip, getShipCoordinates } from '@/lib/game-logic/ships/ship-placement';
import type { Ship as ShipType, CellState, Position } from '@/lib/utils/types';
import { BOARD_SIZE } from '@/lib/utils/constants';
import { createEmptyBoard } from '@/lib/utils/helpers';

const CELL_SIZE = 40; // px

export default function ShipOverlayDemoPage() {
  // Estado de las celdas (solo para visualizar el grid y clicks)
  const [cells, setCells] = useState<CellState[][]>(createEmptyBoard());
  // Estado de la flota
  const [ships, setShips] = useState<ShipType[]>([]);
  // Fase del juego (en el demo usaremos 'placement' para mover/rotar)
  const [phase, setPhase] = useState<'placement' | 'battle'>('placement');

  // Para calcular coordenadas de drop
  const gridRef = useRef<HTMLDivElement | null>(null);

  // Inicializar flota y pintarla
  useEffect(() => {
    const fleet = createFleet();

    // Posiciones de ejemplo válidas (simple y sin overlaps)
    const seeds: Array<{ pos: Position; ori: 'horizontal' | 'vertical' }> = [
      { pos: { row: 0, col: 3 }, ori: 'horizontal' },
      { pos: { row: 2, col: 0 }, ori: 'vertical' },
      { pos: { row: 5, col: 3 }, ori: 'horizontal' },
      { pos: { row: 7, col: 5 }, ori: 'vertical' },
      { pos: { row: 9, col: 0 }, ori: 'horizontal' },
    ];

    const placed = fleet.map((s, i) => placeShip(s, seeds[i].pos, seeds[i].ori, BOARD_SIZE, fleet));
    setShips(placed);
  }, []);

  // Pinta el estado 'ship' en las celdas (solo visual; tu Board real puede ocultar barcos si no es del jugador)
  const paintedCells = useMemo(() => {
    const board = createEmptyBoard();
    ships.forEach((ship) => {
      const coords = getShipCoordinates(ship);
      coords.forEach(({ row, col }) => {
        if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) {
          board[row][col] = 'ship';
        }
      });
    });
    return board;
  }, [ships]);

  // Click en celda (para demostrar que el overlay no bloquea interacciones)
  const handleCellClick = useCallback((row: number, col: number) => {
    console.log(`Cell click @ ${row},${col}`);
    // Ejemplo: alternar 'miss' en la celda
    setCells((prev) => {
      const next = prev.map((r) => r.slice());
      next[row][col] = next[row][col] === 'miss' ? 'empty' : 'miss';
      return next;
    });
  }, []);

  // Rotar barco (doble click o click derecho en Ship)
  const handleShipRotate = useCallback((ship: ShipType) => {
    setShips((prev) => {
      const rotated = rotateShip(ship, BOARD_SIZE, prev);
      return prev.map((s) => (s.id === ship.id ? rotated : s));
    });
  }, []);

  // DRAG & DROP: permitir dragover sobre la grilla
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); // necesario para permitir drop
  }, []);

  // DRAG & DROP: calcular posición final al soltar
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/json');
    if (!data) return;

    const payload = JSON.parse(data);
    if (payload?.type !== 'ship' || !payload?.shipId) return;

    const rect = gridRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Coordenadas del mouse relativas a la grilla
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Snap a celda
    const targetCol = Math.floor(x / CELL_SIZE);
    const targetRow = Math.floor(y / CELL_SIZE);

    setShips((prev) => {
      const ship = prev.find((s) => s.id === payload.shipId);
      if (!ship) return prev;

      const candidate = placeShip(ship, { row: targetRow, col: targetCol }, ship.orientation);

      // Validar posición con el resto de barcos
      const others = prev.filter((s) => s.id !== ship.id);
      const ok = canPlaceShipAt(candidate, candidate.position!, candidate.orientation, BOARD_SIZE, others);
      if (!ok) {
        // posición inválida → no mover
        return prev;
      }

      // aplicar cambio
      return prev.map((s) => (s.id === ship.id ? candidate : s));
    });
  }, []);

  // Toggle fase (para ver que los barcos dejan de ser "draggables" en battle)
  const togglePhase = useCallback(() => {
    setPhase((p) => (p === 'placement' ? 'battle' : 'placement'));
  }, []);

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 to-slate-200">
      <div className="max-w-5xl mx-auto space-y-4">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">🚢 Ship Overlay Demo</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={togglePhase}
              className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Phase: <b className="capitalize ml-1">{phase}</b>
            </button>
          </div>
        </header>

        {/* Contenedor del tablero */}
        <div className="relative inline-block">
          {/* Capa GRID: celdas clickeables */}
          <div
            ref={gridRef}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            style={{
              position: 'relative',
              width: BOARD_SIZE * CELL_SIZE,
              height: BOARD_SIZE * CELL_SIZE,
              display: 'grid',
              gridTemplateRows: `repeat(${BOARD_SIZE}, ${CELL_SIZE}px)`,
              gridTemplateColumns: `repeat(${BOARD_SIZE}, ${CELL_SIZE}px)`,
              border: '2px solid #334155',
              background: '#0f172a',
              gap: 1, // simula separador entre celdas
            }}
          >
            {Array.from({ length: BOARD_SIZE }).map((_, r) =>
              Array.from({ length: BOARD_SIZE }).map((__, c) => (
                <Cell
                  key={`cell-${r}-${c}`}
                  state={paintedCells[r][c] === 'ship' ? 'empty' : (cells[r][c] ?? 'empty')}
                  position={{ row: r, col: c }}
                  onClick={() => handleCellClick(r, c)}
                  disabled={false}
                  showShip={false} // los barcos se muestran con Ship overlay
                  isHovered={false}
                  className="bg-slate-800/60 border border-slate-700 hover:bg-slate-700/60 transition-colors"
                />
              ))
            )}
          </div>

          {/* Capa OVERLAY: barcos (encima de las celdas) */}
          <div
            className="absolute inset-0"
            style={{ pointerEvents: 'none' }} // deja pasar clicks a celdas; Ship habilita eventos puntuales
          >
            {ships.map((ship) => (
              <Ship
                key={ship.id}
                ship={ship}
                boardCellSize={CELL_SIZE}
                isGamePhase={phase}
                isVisible={true}
                // enable eventos del barco:
                onShipRotate={handleShipRotate}
                // para drag necesitamos permitir eventos:
                onShipClick={(s) => console.log('Ship click:', s.id)}
                onShipDragStart={() => {}}
                onShipDragEnd={() => {}}
                className="pointer-events-auto rounded-lg border border-blue-500/70 bg-blue-500/40 backdrop-blur-sm"
              />
            ))}
          </div>
        </div>

        <p className="text-sm text-slate-600">
          Tip: <kbd>drag</kbd> un barco para recolocarlo (fase <b>placement</b>). Doble click o click derecho para rotar.
          Cambia a fase <b>battle</b> para deshabilitar drag/rotate y prueba clicks en celdas (marcan <em>miss</em>).
        </p>
      </div>

      {/* Estilos mínimos para segmentos del barco (maquetación interna) */}
      <style jsx>{`
        .ship {
          display: grid;
          overflow: hidden;
        }
        .ship--horizontal {
          grid-template-rows: 1fr;
          grid-template-columns: repeat(var(--ship-len, 1), 1fr);
        }
        .ship--vertical {
          grid-template-columns: 1fr;
          grid-template-rows: repeat(var(--ship-len, 1), 1fr);
        }
        .ship-segment {
          border: 1px dashed rgba(255,255,255,0.25);
          position: relative;
        }
        .ship-segment--hit {
          background: rgba(239, 68, 68, 0.6);
        }
        .hit-marker {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          font-weight: 700;
          color: white;
        }
      `}</style>
    </div>
  );
}
