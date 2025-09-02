"use client";

import React from 'react';
import type { Ship, Position } from '@/lib/utils/types';

// Props que el componente Ship va a recibir
interface ShipComponentProps {
    ship: Ship;                                    // El objeto Ship completo con toda su data
    boardCellSize: number;                         // Tamaño de cada celda del board (ej: 40px)
    isGamePhase: 'placement' | 'battle';          // Fase actual del juego
    isVisible: boolean;                           // Si el barco debe ser visible (false para enemigos)
    isValidPosition?: boolean;                    // Durante placement, si la posición es válida
    className?: string;                           // Clases CSS adicionales

    // Event handlers para las interacciones
    onShipClick?: (ship: Ship) => void;           // Click en el barco
    onShipDragStart?: (ship: Ship) => void;       // Inicio de drag
    onShipDrag?: (ship: Ship, newPosition: Position) => void;  // Durante el drag
    onShipDragEnd?: (ship: Ship) => void;         // Fin de drag
    onShipRotate?: (ship: Ship) => void;          // Rotar barco (click derecho o doble click)
}

const Ship: React.FC<ShipComponentProps> = ({
    ship,
    boardCellSize,
    isGamePhase,
    isVisible,
    isValidPosition = true,
    className = '',
    onShipClick,
    onShipDragStart,
    onShipDrag,
    onShipDragEnd,
    onShipRotate
}) => {

    // Calcular posición CSS basada en la posición del barco en el board
    const calculateShipPosition = () => {
        if (!ship.position) {
            return { left: 0, top: 0, width: 0, height: 0 };
        }

        const { row, col } = ship.position;
        const left = col * boardCellSize;
        const top = row * boardCellSize;
        
        // Calcular dimensiones basadas en orientación y tamaño
        const width = ship.orientation === 'horizontal' 
            ? ship.size * boardCellSize 
            : boardCellSize;
        const height = ship.orientation === 'vertical' 
            ? ship.size * boardCellSize 
            : boardCellSize;
        return { left, top, width, height };
    };

    const position = calculateShipPosition();

    // Event handlers para interacciones del usuario
    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation(); // Evitar que el click llegue al Board
        
        if (onShipClick) {
            onShipClick(ship);
        }
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Solo permitir rotación durante placement
        if (isGamePhase === 'placement' && onShipRotate) {
            onShipRotate(ship);
        }
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault(); // Evitar menu contextual del browser
        
        // Click derecho también rota durante placement
        if (isGamePhase === 'placement' && onShipRotate) {
            onShipRotate(ship);
        }
    };


    // Drag & Drop handlers para fase de placement
    const handleDragStart = (e: React.DragEvent) => {
        if (isGamePhase !== 'placement') return;
        
        // Configurar data para el drag
        e.dataTransfer.setData('application/json', JSON.stringify({
            shipId: ship.id,
            type: 'ship'
        }));
        
        // Hacer el elemento semi-transparente durante drag
        e.dataTransfer.effectAllowed = 'move';
        
        if (onShipDragStart) {
            onShipDragStart(ship);
        }
    };


    const handleDragEnd = (e: React.DragEvent) => {
        if (isGamePhase !== 'placement') return;
        
        if (onShipDragEnd) {
            onShipDragEnd(ship);
        }
    };

    // Determinar si el barco debe ser draggable
    const isDraggable = isGamePhase === 'placement';

    // Si el barco no tiene posición o no es visible, no renderizar
    if (!ship.position || !isVisible) {
        return null;
    }

    // Generar clases CSS dinámicas basadas en el estado del barco
    const generateShipClasses = () => {
        const classes = [
        'ship',
        `ship--${ship.type}`,              // carrier, destroyer, etc.
        `ship--${ship.orientation}`,       // horizontal, vertical
        `ship--size-${ship.size}`,         // size-2, size-3, etc.
        ];

        // Estados del juego
        if (ship.isSunk) {
            classes.push('ship--sunk');
        }

        // Estados de la fase
        if (isGamePhase === 'placement') {
            classes.push('ship--placement');
        
            if (!isValidPosition) {
                classes.push('ship--invalid-position');
            }
        } else {
            classes.push('ship--battle');
        }

        // Clase personalizada
        if (className) {
            classes.push(className);
        }

        return classes.join(' ');
    };


    // Renderizar cada segmento del barco
    const renderShipSegments = () => {
        return Array.from({ length: ship.size }, (_, segmentIndex) => {
            const isHit = ship.hits[segmentIndex];
            
            return (
                <div
                    key={`${ship.id}-segment-${segmentIndex}`}
                    className={`ship-segment ${isHit ? 'ship-segment--hit' : ''}`}
                    data-segment-index={segmentIndex}
                >
                    {isHit && (
                        <div className="hit-marker">×</div>
                    )}
                </div>
            );
        });
    };

    // Por ahora, componente básico sin implementación
    return (
        <div 
            className={generateShipClasses()}
            data-ship-id={ship.id}
            data-game-phase={isGamePhase}
            draggable={isDraggable}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            onContextMenu={handleContextMenu}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            style={{
                position: 'absolute',
                left: `${position.left}px`,
                top: `${position.top}px`,
                width: `${position.width}px`,
                height: `${position.height}px`,
                cursor: isDraggable ? 'grab' : 'default',
            }}
        >
            {renderShipSegments()}
        </div>
    );
};

export default Ship;