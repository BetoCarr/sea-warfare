'use client';
import React, { useState, useMemo } from 'react';

// ========== TIPOS SIMULADOS ==========
type CellState = 'empty' | 'ship' | 'hit' | 'miss' | 'sunk';
type ShipType = 'carrier' | 'battleship' | 'cruiser' | 'submarine' | 'destroyer';
type Orientation = 'horizontal' | 'vertical';

interface Position {
  row: number;
  col: number;
}

interface Ship {
  id: string;
  type: ShipType;
  size: number;
  position?: Position;
  orientation: Orientation;
  hits: boolean[];
  isSunk: boolean;
}

// ========== FUNCIONES SIMULADAS ==========
// Simulación de createFleet
function createFleet(): Ship[] {
  return [
    {
      id: 'carrier-1',
      type: 'carrier',
      size: 5,
      orientation: 'horizontal',
      hits: [false, false, false, false, false],
      isSunk: false
    },
    {
      id: 'battleship-1',
      type: 'battleship',
      size: 4,
      orientation: 'vertical',
      hits: [false, false, false, false],
      isSunk: false
    },
    {
      id: 'cruiser-1',
      type: 'cruiser',
      size: 3,
      orientation: 'horizontal',
      hits: [false, false, false],
      isSunk: false
    }
  ];
}

// Simulación de placeShip
function placeShip(ship: Ship, position: Position, orientation: Orientation): Ship {
  return {
    ...ship,
    position,
    orientation
  };
}

// Simulación de getShipCoordinates
function getShipCoordinates(ship: Ship): Position[] {
  if (!ship.position) return [];
  
  const coords: Position[] = [];
  for (let i = 0; i < ship.size; i++) {
    if (ship.orientation === 'horizontal') {
      coords.push({
        row: ship.position.row,
        col: ship.position.col + i
      });
    } else {
      coords.push({
        row: ship.position.row + i,
        col: ship.position.col
      });
    }
  }
  return coords;
}

// Simulación de damageShip
function damageShip(ship: Ship, segmentIndex: number): Ship {
  const newHits = [...ship.hits];
  newHits[segmentIndex] = true;
  
  const isSunk = newHits.every(hit => hit);
  
  return {
    ...ship,
    hits: newHits,
    isSunk
  };
}

// ========== BOARD FACTORY FUNCTIONS ==========

function createEmptyBoard(size = 10): CellState[][] {
  return Array.from({ length: size }, () => 
    Array.from({ length: size }, () => 'empty')
  );
}

// ========== BOARD SYNC FUNCTIONS ==========

function syncBoardFromShips(ships: Ship[], attacks: Position[] = [], size = 10): CellState[][] {
  const board = createEmptyBoard(size);
  
  // PASO 1: Mapear coordenadas de barcos
  const shipCoordinatesMap = new Map<string, { ship: Ship; segmentIndex: number }>();
  
  ships.forEach(ship => {
    if (!ship.position) return;
    const coordinates = getShipCoordinates(ship);
    coordinates.forEach((pos, segmentIndex) => {
      const key = `${pos.row},${pos.col}`;
      shipCoordinatesMap.set(key, { ship, segmentIndex });
    });
  });
  
  // PASO 2: Procesar ataques
  attacks.forEach(attackPos => {
    const key = `${attackPos.row},${attackPos.col}`;
    const shipInfo = shipCoordinatesMap.get(key);
    
    if (shipInfo) {
      const { ship, segmentIndex } = shipInfo;
      const isSegmentHit = ship.hits[segmentIndex];
      
      if (isSegmentHit) {
        board[attackPos.row][attackPos.col] = ship.isSunk ? 'sunk' : 'hit';
      } else {
        board[attackPos.row][attackPos.col] = 'ship';
      }
    } else {
      board[attackPos.row][attackPos.col] = 'miss';
    }
  });
  
  // PASO 3: Marcar barcos no atacados
  ships.forEach(ship => {
    if (!ship.position) return;
    const coordinates = getShipCoordinates(ship);
    coordinates.forEach((pos) => {
      const wasAttacked = attacks.some(attack => 
        attack.row === pos.row && attack.col === pos.col
      );
      
      if (!wasAttacked) {
        board[pos.row][pos.col] = 'ship';
      }
    });
  });
  
  return board;
}

// ========== COMPONENTE PRINCIPAL ==========

export default function BoardSyncDemo() {
  // Estado inicial: crear flota y colocar barcos
  const [ships, setShips] = useState<Ship[]>(() => {
    const fleet = createFleet();
    return [
      placeShip(fleet[0], { row: 0, col: 0 }, 'horizontal'), // Carrier (5)
      placeShip(fleet[1], { row: 2, col: 0 }, 'vertical'),   // Battleship (4)
      placeShip(fleet[2], { row: 5, col: 5 }, 'horizontal'), // Cruiser (3)
    ];
  });
  
  const [attacks, setAttacks] = useState<Position[]>([]);
  const [step, setStep] = useState(0);
  
  // Generar board usando syncBoardFromShips
  const board = useMemo(() => {
    return syncBoardFromShips(ships, attacks);
  }, [ships, attacks]);
  
  // Función para simular ataques paso a paso
  const simulateAttack = () => {
    const simulatedAttacks: Position[] = [
      { row: 0, col: 0 }, // Hit al carrier
      { row: 0, col: 1 }, // Hit al carrier
      { row: 1, col: 1 }, // Miss
      { row: 2, col: 0 }, // Hit al battleship
      { row: 0, col: 2 }, // Hit al carrier
      { row: 3, col: 3 }, // Miss
      { row: 0, col: 3 }, // Hit al carrier
      { row: 0, col: 4 }, // Hit al carrier (se hunde)
    ];
    
    if (step < simulatedAttacks.length) {
      const newAttack = simulatedAttacks[step];
      setAttacks(prev => [...prev, newAttack]);
      
      // Aplicar daño al barco si es hit
      const hitShip = ships.find(ship => {
        if (!ship.position) return false;
        const coords = getShipCoordinates(ship);
        return coords.some(pos => pos.row === newAttack.row && pos.col === newAttack.col);
      });
      
      if (hitShip) {
        const coords = getShipCoordinates(hitShip);
        const segmentIndex = coords.findIndex(pos => 
          pos.row === newAttack.row && pos.col === newAttack.col
        );
        
        if (segmentIndex !== -1) {
          const damagedShip = damageShip(hitShip, segmentIndex);
          setShips(prev => prev.map(s => s.id === hitShip.id ? damagedShip : s));
        }
      }
      
      setStep(prev => prev + 1);
    }
  };
  
  const reset = () => {
    setAttacks([]);
    setStep(0);
    // Resetear hits en barcos
    setShips(prev => prev.map(ship => ({
      ...ship,
      hits: Array(ship.size).fill(false),
      isSunk: false
    })));
  };
  
  // Función para renderizar el board
  const renderBoard = () => {
    return (
      <div className="grid grid-cols-10 gap-1 p-4 bg-slate-800 rounded-lg">
        {board.map((row, r) => 
          row.map((cell, c) => {
            const isAttacked = attacks.some(a => a.row === r && a.col === c);
            
            return (
              <div
                key={`${r}-${c}`}
                className={`
                  w-8 h-8 border border-slate-600 flex items-center justify-center text-xs font-bold
                  ${cell === 'empty' ? 'bg-blue-900' : ''}
                  ${cell === 'ship' ? 'bg-gray-500' : ''}
                  ${cell === 'hit' ? 'bg-red-500 text-white' : ''}
                  ${cell === 'miss' ? 'bg-blue-600 text-white' : ''}
                  ${cell === 'sunk' ? 'bg-red-900 text-white' : ''}
                  ${isAttacked ? 'ring-2 ring-yellow-400' : ''}
                `}
              >
                {cell === 'hit' && '×'}
                {cell === 'miss' && '○'}
                {cell === 'sunk' && '☠'}
                {cell === 'ship' && '■'}
              </div>
            );
          })
        )}
      </div>
    );
  };
  
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">🎯 Board Sync Demo</h1>
        <p className="text-gray-600">Paso {step}/8 - Observa cómo ships (fuente de verdad) se sincronizan con el board</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Board Visual */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">📋 Board Visual (generado from ships)</h2>
          {renderBoard()}
          <div className="flex gap-3 text-xs flex-wrap">
            <span className="flex items-center gap-1">
              <div className="w-4 h-4 bg-gray-500 border"></div> Ship
            </span>
            <span className="flex items-center gap-1">
              <div className="w-4 h-4 bg-red-500 border"></div> Hit
            </span>
            <span className="flex items-center gap-1">
              <div className="w-4 h-4 bg-blue-600 border"></div> Miss
            </span>
            <span className="flex items-center gap-1">
              <div className="w-4 h-4 bg-red-900 border"></div> Sunk
            </span>
          </div>
          
          <div className="bg-yellow-100 p-3 rounded-lg text-sm">
            <strong>syncBoardFromShips() en acción:</strong>
            <br />1. Mapea coordenadas de barcos
            <br />2. Procesa {attacks.length} ataques
            <br />3. Marca barcos no atacados
          </div>
        </div>
        
        {/* Ship States */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">🚢 Ships State (fuente de verdad)</h2>
          <div className="space-y-3 bg-slate-100 p-4 rounded-lg max-h-80 overflow-y-auto">
            {ships.map(ship => (
              <div key={ship.id} className="p-3 bg-white rounded border">
                <div className="font-medium text-sm capitalize flex justify-between">
                  <span>{ship.type} (size: {ship.size})</span>
                  <span className={`text-xs px-2 py-1 rounded ${ship.isSunk ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {ship.isSunk ? '☠ SUNK' : '⛵ Afloat'}
                  </span>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  Position: ({ship.position?.row}, {ship.position?.col}) {ship.orientation}
                </div>
                <div className="text-xs mt-2">
                  <strong>Hits array:</strong> [{ship.hits.map((h, i) => 
                    <span key={i} className={h ? 'text-red-600' : 'text-green-600'}>
                      {h ? '●' : '○'}
                    </span>
                  )}]
                </div>
                <div className="text-xs mt-1 text-gray-500">
                  Hits count: {ship.hits.filter(h => h).length}/{ship.size}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={simulateAttack}
          disabled={step >= 8}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🎯 Simular Ataque {step < 8 ? `${step + 1}` : '(Completado)'}
        </button>
        <button
          onClick={reset}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          🔄 Reset Demo
        </button>
      </div>
      
      {/* Debug Info */}
      <div className="bg-slate-100 p-4 rounded-lg text-sm">
        <h3 className="font-semibold mb-2">🐛 Debug Info:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <strong>Ataques realizados:</strong> {attacks.length}
            <div className="text-xs mt-1 font-mono">
              {attacks.length > 0 ? attacks.map((a, i) => `(${a.row},${a.col})`).join(', ') : 'Ninguno'}
            </div>
          </div>
          <div>
            <strong>Barcos hundidos:</strong> {ships.filter(s => s.isSunk).length}/{ships.length}
          </div>
          <div>
            <strong>Hits totales:</strong> {ships.reduce((acc, s) => acc + s.hits.filter(h => h).length, 0)}
          </div>
        </div>
        
        {step >= 8 && (
          <div className="mt-3 p-2 bg-green-100 rounded text-green-800">
            ✅ Demo completado! El carrier está hundido y puedes ver cómo el board se sincroniza automáticamente.
          </div>
        )}
      </div>
    </div>
  );
}

