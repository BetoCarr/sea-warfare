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

    // Por ahora, componente básico sin implementación
    return (
        <div>
            Ship Component - {ship.type} (size: {ship.size})
        </div>
    );
};

export default Ship;