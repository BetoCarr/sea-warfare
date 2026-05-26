"use client";

import React from 'react';
import type { Ship } from '@/lib/utils/types';
import type { Position } from '@/lib/domain/shared/models/Position';

/**
 * Props for the Ship component
 */
interface ShipComponentProps {
    ship: Ship;                                    // Full ship object with its data
    boardCellSize: number;                         // Size of a single board cell in px (e.g., 40px)
    isGamePhase: 'placement' | 'battle';           // Current game phase
    isVisible: boolean;                            // Whether the ship should be visible (false for enemy ships)
    isValidPosition?: boolean;                     // During placement, indicates if the position is valid
    className?: string;                            // Extra CSS classes

    // Event handlers for interactions
    onShipClick?: (ship: Ship) => void;            // Left-click on the ship
    onShipDragStart?: (ship: Ship) => void;        // Drag start
    onShipDrag?: (ship: Ship, newPosition: Position) => void;  // While dragging
    onShipDragEnd?: (ship: Ship) => void;          // Drag end
    onShipRotate?: (ship: Ship) => void;           // Rotate (double click or right-click)
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

    /**
     * Compute ship CSS position and size based on its
     * board position (row/col) and orientation.
     */
    const calculateShipPosition = () => {
        if (!ship.position) {
            return { left: 0, top: 0, width: 0, height: 0 };
        }

        const { row, col } = ship.position;
        const left = col * boardCellSize;
        const top = row * boardCellSize;
        
        const width = ship.orientation === 'horizontal' 
            ? ship.size * boardCellSize 
            : boardCellSize;
        const height = ship.orientation === 'vertical' 
            ? ship.size * boardCellSize 
            : boardCellSize;
        return { left, top, width, height };
    };

    const position = calculateShipPosition();

    /**
     * Handle left-click on ship
     */
    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent bubbling up to Board
        if (onShipClick) {
            onShipClick(ship);
        }
    };

    /**
     * Handle double click → rotate ship during placement
     */
    const handleDoubleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
    
        if (isGamePhase === 'placement' && onShipRotate) {
            onShipRotate(ship);
        }
    };

    /**
     * Handle right-click → rotate ship during placement
     */
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault(); // Evitar menu contextual del browser
        
        // Click derecho también rota durante placement
        if (isGamePhase === 'placement' && onShipRotate) {
            onShipRotate(ship);
        }
    };

    /**
     * Drag handlers (only enabled during placement)
     */    
    const handleDragStart = (e: React.DragEvent) => {
        if (isGamePhase !== 'placement') return;
        
        // Configurar data para el drag
        e.dataTransfer.setData('application/json', JSON.stringify({
            shipId: ship.id,
            type: 'ship'
        }));
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

    // Draggable only in placement phase
    const isDraggable = isGamePhase === 'placement';

    // If hidden (enemy board) or unplaced, don’t render
    if (!ship.position || !isVisible) {
        return null;
    }

    /**
     * Generate CSS classes dynamically based on ship type,
     * orientation, size, phase and state.
     */
    const generateShipClasses = () => {
        const classes = [
        'ship',
        `ship--${ship.type}`,           // e.g. carrier, destroyer
        `ship--${ship.orientation}`,    // horizontal / vertical
        `ship--size-${ship.size}`,      // size modifier
        ];

        if (ship.isSunk) {
            classes.push('ship--sunk');
        }

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


    /**
     * Render each ship segment (for hit markers).
     */    
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
    
    /**
     * Main render: absolute-positioned ship with segments
     */
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