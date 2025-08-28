// src/components/game/Board.tsx
'use client';

import { useState, useCallback, useMemo } from 'react';
import Cell from './Cell';
import { cn } from '@/lib/utils/utils';
import { BOARD_SIZE } from '@/lib/utils/constants';
import type {CellState, Position, Ship } from '@/lib/utils/types';

interface BoardProps {
    /** Tamaño del tablero (por defecto 10x10) */
    size?: number;
    /** Estado de cada celda del tablero */
    cells: CellState[][];
    /** Si es el tablero del jugador (muestra barcos) o del oponente (oculta barcos) */
    isPlayerBoard: boolean;
    /** Callback cuando se hace click en una celda */
    onCellClick: (row: number, col: number) => void;
    /** Lista de barcos colocados en el tablero */
    ships?: Ship[];
    /** Forzar mostrar todos los barcos (útil para debug o fin de juego) */
    forceShowShips?: boolean;
    /** Deshabilitar interacciones */
    disabled?: boolean;
    /** Título del tablero */
    title?: string;
    /** Estilo adicional */
    className?: string;
    /** Celda que está siendo hover (para efectos visuales) */
    hoveredCell?: Position | null;
}

export default function Board({
    size = BOARD_SIZE,
    cells,
    isPlayerBoard,
    onCellClick,
    ships = [],
    forceShowShips = false,
    disabled = false,
    title,
    className,
    hoveredCell
}: BoardProps) {
    // Estado local para manejar hover en celdas
    const [localHoveredCell, setLocalHoveredCell] = useState<Position | null>(null);

    // Determinar si mostrar barcos
    const showShips = isPlayerBoard || forceShowShips;
    
    // Combinar hover externo con hover local
    const effectiveHoveredCell = hoveredCell || localHoveredCell;

    /**
     * Manejar click en celda individual
     */
    const handleCellClick = useCallback((row: number, col: number) => {
        if (disabled) return;
        onCellClick(row, col);
    }, [disabled, onCellClick]);

    /**
     * Manejar hover sobre celda
     */
    const handleCellHover = useCallback((row: number, col: number) => {
        if (!disabled) {
            setLocalHoveredCell({ row, col });
        }
    }, [disabled]);

    /**
     * Manejar cuando se sale el hover
     */
    const handleCellLeave = useCallback(() => {
        setLocalHoveredCell(null);
    }, []);

    /**
     * Generar las etiquetas de coordenadas (A, B, C... para columnas)
     */
    const columnLabels = useMemo(() => {
        return Array.from({ length: size }, (_, i) => String.fromCharCode(65 + i));
    }, [size]);

    /**
     * Generar las etiquetas de coordenadas (1, 2, 3... para filas)
     */
    const rowLabels = useMemo(() => {
        return Array.from({ length: size }, (_, i) => i + 1);
    }, [size]);

    /**
     * Verificar si una celda está siendo hover
     */
    const isCellHovered = useCallback((row: number, col: number) => {
        return effectiveHoveredCell?.row === row && effectiveHoveredCell?.col === col;
    }, [effectiveHoveredCell]);

    /**
     * Obtener información adicional de la celda (ej: si tiene barco)
     */
    const getCellInfo = useCallback((row: number, col: number) => {
        // Buscar si hay un barco en esta posición
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
            isShipStart: shipInCell?.position?.row === row && shipInCell?.position?.col === col
        };
    }, [ships]);

    /**
     * Determinar el estado visual de una celda
     */
    const getCellDisplayState = useCallback((row: number, col: number): CellState => {
        const currentState = cells[row]?.[col] || 'empty';
        const cellInfo = getCellInfo(row, col);
        
        // Si la celda tiene estado hit, miss, o sunk, mostrar ese estado
        if (currentState === 'hit' || currentState === 'miss' || currentState === 'sunk') {
            return currentState;
        }
        
        // Si hay un barco y debemos mostrarlo
        if (cellInfo.hasShip && showShips) {
            return 'ship';
        }
        
        return 'empty';
    }, [cells, getCellInfo, showShips]);

    return (
        <div className={cn("inline-block", className)}>
            {/* Título del tablero */}
            {title && (
                <h3 className="text-lg font-semibold mb-3 text-center text-slate-800">
                    {title}
                </h3>
            )}
        
            {/* Contenedor principal del tablero */}
            <div className="bg-white rounded-lg shadow-lg p-4 border-2 border-slate-200">
                {/* Etiquetas de columnas (A, B, C...) */}
                <div className="grid mb-2" style={{ gridTemplateColumns: `2rem repeat(${size}, 2rem)` }}>
                    <div></div> {/* Celda vacía para esquina */}
                    {columnLabels.map((label) => (
                        <div
                            key={label}
                            className="text-center text-sm font-semibold text-slate-600 h-8 flex items-center justify-center"
                        >
                            {label}
                        </div>
                    ))}
                </div>

                {/* Tablero principal */}
                <div className="grid gap-1" style={{ gridTemplateColumns: `2rem repeat(${size}, 2rem)` }}>
                    {Array.from({ length: size }, (_, rowIndex) => (
                        // Cada fila
                        <>
                            {/* Etiqueta de fila (1, 2, 3...) */}
                            <div
                                key={`row-label-${rowIndex}`}
                                className="text-center text-sm font-semibold text-slate-600 w-8 h-8 flex items-center justify-center"
                            >
                                {rowLabels[rowIndex]}
                            </div>
                            
                            {/* Celdas de la fila */}
                            {Array.from({ length: size }, (_, colIndex) => (
                                <div
                                    key={`cell-${rowIndex}-${colIndex}`}
                                    onMouseEnter={() => handleCellHover(rowIndex, colIndex)}
                                    onMouseLeave={handleCellLeave}
                                    className="relative"
                                >
                                    <Cell
                                        state={getCellDisplayState(rowIndex, colIndex)}
                                        position={{ row: rowIndex, col: colIndex }}
                                        onClick={() => handleCellClick(rowIndex, colIndex)}
                                        disabled={disabled}
                                        showShip={showShips}
                                        isHovered={isCellHovered(rowIndex, colIndex)}
                                        className={cn(
                                        // Estilos base del tablero
                                        "transition-all duration-200",
                                        
                                        // Efectos de hover para filas/columnas
                                        effectiveHoveredCell && (
                                            effectiveHoveredCell.row === rowIndex || 
                                            effectiveHoveredCell.col === colIndex
                                        ) && "ring-1 ring-blue-300 ring-opacity-50",
                                        
                                        // Estilo especial para tablero del jugador vs oponente
                                        isPlayerBoard 
                                            ? "border-blue-400" 
                                            : "border-red-400",
                                        )}
                                    />
                                </div>
                            ))}
                        </>
                    ))}
                </div>
                {/* Información del tablero (debug/stats) */}
                <div className="mt-3 text-xs text-slate-500 text-center">
                    {isPlayerBoard ? "Tu tablero" : "Tablero enemigo"} • 
                    {ships.length} barco{ships.length !== 1 ? 's' : ''} • 
                    {size}×{size}
                    {disabled && " • Deshabilitado"}
                </div>
            </div>
        </div>
    );
}

// Componente auxiliar para mostrar estadísticas del tablero
    interface BoardStatsProps {
    ships: Ship[];
    totalHits: number;
    totalMisses: number;
}

export function BoardStats({ ships, totalHits, totalMisses }: BoardStatsProps) {
    const shipsRemaining = ships.filter(ship => !ship.isSunk).length;
    const shipsTotal = ships.length;
    
    return (
        <div className="bg-slate-100 rounded-lg p-3 text-sm">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="font-semibold text-slate-700">Barcos</p>
                    <p className="text-slate-600">{shipsRemaining}/{shipsTotal} activos</p>
                </div>
                <div>
                    <p className="font-semibold text-slate-700">Disparos</p>
                    <p className="text-slate-600">
                        <span className="text-red-600">{totalHits}</span> impactos • 
                        <span className="text-blue-600">{totalMisses}</span> fallos
                    </p>
                </div>
            </div>
        </div>
    );
}