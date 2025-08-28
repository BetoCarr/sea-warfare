// src/app/page.tsx - Demo completo del componente Board
'use client';

import { useState, useCallback } from 'react';
import Board, { BoardStats } from '@/components/game/Board';
import { type CellState, type Position, type Ship} from '@/lib/utils/types';
import { createEmptyBoard, positionToCoordinate } from '@/lib/utils/helpers';
import { BOARD_SIZE } from '@/lib/utils/constants';

export default function BoardDemo() {
  // Estado de los tableros
  const [playerBoard, setPlayerBoard] = useState<CellState[][]>(createEmptyBoard());
  const [aiBoard, setAiBoard] = useState<CellState[][]>(createEmptyBoard());
  
  // Barcos de ejemplo
  const [playerShips] = useState<Ship[]>([
    {
      id: 'player-carrier',
      type: 'carrier',
      size: 5,
      position: { row: 1, col: 1 },
      orientation: 'horizontal',
      hits: [false, false, false, false, false],
      isSunk: false
    },
    {
      id: 'player-battleship',
      type: 'battleship',
      size: 4,
      position: { row: 3, col: 2 },
      orientation: 'vertical',
      hits: [true, false, true, false],
      isSunk: false
    },
    {
      id: 'player-destroyer',
      type: 'destroyer',
      size: 2,
      position: { row: 6, col: 7 },
      orientation: 'horizontal',
      hits: [true, true],
      isSunk: true
    }
  ]);

  const [aiShips] = useState<Ship[]>([
    {
      id: 'ai-carrier',
      type: 'carrier',
      size: 5,
      position: { row: 0, col: 3 },
      orientation: 'horizontal',
      hits: [false, false, false, false, false],
      isSunk: false
    },
    {
      id: 'ai-cruiser',
      type: 'cruiser',
      size: 3,
      position: { row: 4, col: 1 },
      orientation: 'vertical',
      hits: [true, true, false],
      isSunk: false
    }
  ]);

  const [gamePhase, setGamePhase] = useState<'setup' | 'playing' | 'finished'>('playing');
  const [showAiShips, setShowAiShips] = useState(false);
  const [totalHits, setTotalHits] = useState(0);
  const [totalMisses, setTotalMisses] = useState(0);

  // Inicializar tableros con estados de ejemplo
  useState(() => {
    // Configurar tablero del jugador con algunos hits
    const newPlayerBoard = createEmptyBoard();
    
    // Marcar hits en el battleship
    newPlayerBoard[3][2] = 'hit'; // Primera hit
    newPlayerBoard[5][2] = 'hit'; // Segunda hit
    
    // Marcar destroyer como hundido
    newPlayerBoard[6][7] = 'sunk';
    newPlayerBoard[6][8] = 'sunk';
    
    // Algunos misses
    newPlayerBoard[0][0] = 'miss';
    newPlayerBoard[2][5] = 'miss';
    
    setPlayerBoard(newPlayerBoard);

    // Configurar tablero de IA con algunos shots del jugador
    const newAiBoard = createEmptyBoard();
    
    // Hits del jugador en barcos de IA
    newAiBoard[4][1] = 'hit'; // Hit en cruiser
    newAiBoard[5][1] = 'hit'; // Hit en cruiser
    
    // Misses del jugador
    newAiBoard[1][1] = 'miss';
    newAiBoard[7][3] = 'miss';
    newAiBoard[2][8] = 'miss';
    
    setAiBoard(newAiBoard);
  });

  /**
   * Manejar click en tablero del jugador (recibir ataques de IA)
   */
  const handlePlayerBoardClick = useCallback((row: number, col: number) => {
    console.log(`IA atacó posición: ${positionToCoordinate({ row, col })}`);
    // En un juego real, aquí manejaríamos el ataque de la IA
  }, []);

  /**
   * Manejar click en tablero de IA (atacar)
   */
  const handleAiBoardClick = useCallback((row: number, col: number) => {
    const coordinate = positionToCoordinate({ row, col });
    console.log(`Jugador atacó posición: ${coordinate}`);
    
    // Simular ataque
    const newBoard = [...aiBoard];
    const currentState = newBoard[row][col];
    
    if (currentState === 'empty') {
      // Simular hit o miss aleatorio
      const isHit = Math.random() > 0.7; // 30% chance de hit
      newBoard[row][col] = isHit ? 'hit' : 'miss';
      
      if (isHit) {
        setTotalHits(prev => prev + 1);
      } else {
        setTotalMisses(prev => prev + 1);
      }
      
      setAiBoard(newBoard);
    }
  }, [aiBoard]);

  /**
   * Reiniciar tableros
   */
  const resetBoards = () => {
    setPlayerBoard(createEmptyBoard());
    setAiBoard(createEmptyBoard());
    setTotalHits(0);
    setTotalMisses(0);
    setShowAiShips(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            🚢 Sea Warfare - Board Component Demo
          </h1>
          <p className="text-slate-600">
            Tableros interactivos con barcos, estados y efectos visuales
          </p>
        </div>

        {/* Controles */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-center">
            <button
              onClick={() => setShowAiShips(!showAiShips)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              {showAiShips ? 'Ocultar' : 'Mostrar'} barcos enemigos
            </button>
            
            <button
              onClick={resetBoards}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Reiniciar tableros
            </button>
            
            <div className="text-sm text-slate-600">
              Fase: <span className="font-semibold capitalize">{gamePhase}</span>
            </div>
          </div>
        </div>

        {/* Tableros lado a lado */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          
          {/* Tablero del Jugador */}
          <div className="space-y-4">
            <Board
              cells={playerBoard}
              isPlayerBoard={true}
              onCellClick={handlePlayerBoardClick}
              ships={playerShips}
              title="🛡️ Tu Tablero"
              disabled={gamePhase === 'finished'}
            />
            
            <BoardStats
              ships={playerShips}
              totalHits={2} // Ejemplo: hits recibidos
              totalMisses={2} // Ejemplo: misses recibidos
            />
          </div>

          {/* Tablero de IA */}
          <div className="space-y-4">
            <Board
              cells={aiBoard}
              isPlayerBoard={false}
              onCellClick={handleAiBoardClick}
              ships={aiShips}
              forceShowShips={showAiShips}
              title="🎯 Tablero Enemigo"
              disabled={gamePhase === 'finished'}
            />
            
            <BoardStats
              ships={aiShips}
              totalHits={totalHits}
              totalMisses={totalMisses}
            />
          </div>
        </div>

        {/* Información del juego */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Estado del Juego</h3>
          
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-blue-50 rounded p-3">
              <h4 className="font-semibold text-blue-800">Tus Barcos</h4>
              <ul className="mt-2 space-y-1">
                {playerShips.map(ship => (
                  <li key={ship.id} className="flex justify-between">
                    <span className="capitalize">{ship.type}</span>
                    <span className={ship.isSunk ? 'text-red-600' : 'text-green-600'}>
                      {ship.isSunk ? '💀 Hundido' : '⚓ Activo'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-red-50 rounded p-3">
              <h4 className="font-semibold text-red-800">Barcos Enemigos</h4>
              <ul className="mt-2 space-y-1">
                {aiShips.map(ship => (
                  <li key={ship.id} className="flex justify-between">
                    <span className="capitalize">{ship.type}</span>
                    <span className={ship.isSunk ? 'text-red-600' : 'text-gray-600'}>
                      {showAiShips ? (ship.isSunk ? '💀 Hundido' : '⚓ Activo') : '❓'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-yellow-50 rounded p-3">
              <h4 className="font-semibold text-yellow-800">Instrucciones</h4>
              <ul className="mt-2 space-y-1 text-xs">
                <li>• Click en tablero enemigo para atacar</li>
                <li>• Azul = agua, Gris = barco</li>
                <li>• 💥 = impacto, ○ = fallo</li>
                <li>• 💀 = barco hundido</li>
                <li>• Usa controles para cambiar vista</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-slate-600">
          <p>✅ Board component completamente implementado</p>
          <p>🚀 Listo para integrar con lógica de juego y AI</p>
        </div>
      </div>
    </div>
  );
}