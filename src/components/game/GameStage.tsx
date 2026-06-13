"use client";
import React, { useEffect } from 'react';
import { useGameStore } from '@/lib/store/game-store';
import { cn } from '@/lib/utils/utils';
import Board from './Board';
import { ShipPalette } from './ShipPalette';
import { FeedbackMessage, FeedbackType } from '../hud/FeedbackMessage';
import { OrientationToggle } from './OrientationToggle';
import { useBoardViewModel } from '@/application/board/useBoardViewModel';
import type { Position } from '@/lib/domain/shared/models/Position';
import { useGameFlowController } from '@/application/game-flow/useGameFlowController';
import { usePlacementFlow } from '@/application/placement/hooks/usePlacementFlow';

interface GameStageProps {
    activeMessage: string | null;
    activeType: FeedbackType;
    onDismissFeedback: () => void;  
    onPlayerCellClick: (row: number, col: number) => void;
    onCellInteract: (type: 'start' | 'commit' | 'hover' | 'cancel', row: number, col: number, e: any) => void;
    draggingShipId?: string | null;
}

/**
 * GameStage
 * ------------------------------------------------------------
 * Manages the main game area, including the Board and 
 * the FeedbackMessage overlay.
 * 
 * Refactored from GameScreen to improve modularity.
 */
export const GameStage = ({
    activeMessage,
    activeType,
    onDismissFeedback,
    onPlayerCellClick,
    draggingShipId,
}: GameStageProps) => {

    const playerBoard = useGameStore(s => s.player.boardState.board);

    const playerShips = useGameStore(s => s.player.ships);


    const placement = usePlacementFlow();

    console.log("preview from store", placement.preview);
    // console.log(placement);
    const flow = useGameFlowController();


    const boardVM = useBoardViewModel({
        boardVariant: 'player',
        size: 10,
        cells: playerBoard,
        ships: playerShips,
        hoveredCell: null, // por ahora no lo usamos
        preview: placement.preview,
        draggingShipId,
        showShips: true,
    });

    const handleBoardTap = (position: Position) => {
        if (flow.capabilities.canPlaceShip) {
            // mobilePlacement.onBoardTap(position);
            return;
        }

        onPlayerCellClick(position.row, position.col);
    };

    // Keyboard shortcut 'R' for rotation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'r') {
                placement.rotate();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [placement.orientation]);

    return (
        <main className={cn(
            "flex-1 min-h-0 overflow-hidden flex flex-col items-stretch relative px-4 md:px-8",
            "transition-all duration-700 ease-in-out",
            flow.capabilities.canPlaceShip && "md:pr-[280px]"
        )}>
            {/* 1. TOP SLOT: Feedback / Instructions (Stable Height) */}
            <div className="h-20 sm:h-24 flex items-center justify-center shrink-0">
                <FeedbackMessage 
                    message={activeMessage} 
                    type={activeType} 
                    onDismiss={onDismissFeedback}
                    className="pointer-events-auto shadow-xl backdrop-blur-md ring-1 ring-white/10"
                />
            </div>

            {/* 2. CENTER SLOT: The Main Engagement Area (Board) */}
            <div className="w-full max-w-full flex items-center justify-center transition-transform duration-500">
                <div className="flex-1 min-h-0 flex items-center justify-center py-2 sm:py-4">                
                    {/* <Board
                        boardVM={boardVM}
                        onCellPress={handleBoardTap}
                    /> */}
                    <Board
                        boardVM={boardVM}
                        interactive={
                            flow.capabilities.canPlaceShip ||
                            flow.capabilities.canAttack
                        }
                        onCellHover={placement.setHoveredCell}
                        onCellLeave={() =>
                            placement.setHoveredCell(null)
                        }
                        onCellPress={handleBoardTap}
                    />  
                </div>
            </div>
            {/* 3. BOTTOM SLOT: Ship Palette */}
            {flow.capabilities.canPlaceShip && (
                <div className="shrink-0 flex flex-col gap-2 sm:gap-4 px-1">
                    <div className="flex justify-between items-center">
                        <OrientationToggle
                            orientation={placement.orientation} 
                            onToggle={placement.rotate} 
                        />
                    </div>
                    <ShipPalette /> 
                </div>
            )}
        </main>
    );
};
