"use client";

import React, { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '@/lib/store/game-store';
import { GamePhase } from '@/lib/store/game-types';
import { cn } from '@/lib/utils/utils';
import Board from './Board';
import { ShipPalette } from './ShipPalette';
import { FeedbackMessage, FeedbackType } from '../hud/FeedbackMessage';
import { PlacementPreview } from '@/lib/game-logic/placement/placement-types';
import { useShipPlacementMobileBridge } from '@/application/placement/mobile/useShipPlacementMobileBridge';
import { createFleet } from '@/lib/game-logic/ships/ship-factory';

interface GameStageProps {
    activeMessage: string | null;
    activeType: FeedbackType;
    onDismissFeedback: () => void;
    onPlayerCellClick: (row: number, col: number) => void;
    onCellInteract: (type: 'start' | 'commit' | 'hover' | 'cancel', row: number, col: number, e: any) => void;
    draggingShipId?: string | null;
    preview?: PlacementPreview | null;
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
    onCellInteract,
    draggingShipId,
    preview
}: GameStageProps) => {

    const ships = useMemo(()=> createFleet(), [])

    const phase = useGameStore(s => s.phase);
    const playerBoard = useGameStore(s => s.player.boardState.board);
    const playerShips = useGameStore(s => s.player.ships);

    const placedShipIds = useMemo(
        () => playerShips.map(ship => ship.id),
        [playerShips]
    );

    // --- Mobile Bridge ---
    const placement = useShipPlacementMobileBridge();

    return (
        <main className={cn(
            "flex-1 min-h-0 overflow-hidden flex flex-col items-stretch relative px-4 md:px-8",
            "transition-all duration-700 ease-in-out",
            phase === GamePhase.PLACEMENT && "md:pr-[280px]"
        )}>
            {/* 1. TOP SLOT: Feedback / Instructions (Stable Height) */}
            <div className="h-20 sm:h-24 flex items-center justify-center flex-none z-20 pointer-events-none">
                <FeedbackMessage 
                    message={activeMessage} 
                    type={activeType} 
                    onDismiss={onDismissFeedback}
                    className="pointer-events-auto shadow-xl backdrop-blur-md ring-1 ring-white/10"
                />
            </div>

            {/* 2. CENTER SLOT: The Main Engagement Area (Board) */}
            <div className="flex items-center justify-center min-h-0 py-2 sm:py-4">
                <div className="w-full max-w-full flex items-center justify-center transition-transform duration-500">
                    <Board
                        size={10}
                        cells={playerBoard}
                        isPlayerBoard={true}
                        onCellClick={onPlayerCellClick}
                        onCellInteract={onCellInteract}
                        ships={ships}
                        forceShowShips={true}
                        disabled={phase === GamePhase.GAME_OVER}
                        draggingShipId={draggingShipId}
                        preview={preview}
                    />
                </div>
            </div>
            <ShipPalette
                ships={ships}
                placedShipIds={placedShipIds}
                selectedShipId={placement.selectedShipId}
                orientation={placement.orientation}
                onShipSelect={placement.selectShip}
                onRotate={placement.rotate}
            /> 
        </main>
    );
};
