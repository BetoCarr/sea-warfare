"use client";
import React from 'react';



import { FeedbackMessage, FeedbackType } from './FeedbackMessage';

import Board from '../../board/Board';

import PlayerSection from '../../game/GameStage/PlayerSection/PlayerSection';

import { OrientationToggle } from '../../placement/OrientationToggle';

import { ShipPalette } from '../../placement/ShipPalette';

import { useBoardViewModel } from '@/application/board/useBoardViewModel';

import { useGameFlowController } from '@/application/game-flow/useGameFlowController';

import { usePlacementFlow } from '@/application/placement/hooks/usePlacementFlow';

import { usePlacementKeyboardShortcuts } from '@/application/placement/interactions/usePlacementKeyboardShortcuts';

import { cn } from '@/lib/utils/utils';

interface GameStageProps {
    activeMessage: string | null;
    activeType: FeedbackType;
    supportsHover: boolean;
    onDismissFeedback: () => void;  
    onPlayerCellClick: (row: number, col: number) => void;
}

export const GameStage = ({
    activeMessage,
    activeType,
    supportsHover,
    onDismissFeedback,
    onPlayerCellClick,
}: GameStageProps) => {


    const placement = usePlacementFlow();
    const flow = useGameFlowController();

    console.log(flow)

    const boardVM = useBoardViewModel({
        boardVariant: 'player',
        size: 10,
        playerPlacements: placement.playerPlacements,
        preview: placement.preview,
        selectedShipType: placement.selectedShipType,
        showShips: true,
    });
    
    usePlacementKeyboardShortcuts({
        rotate: placement.rotate,
    });

    return (
        <main className={cn(
            "flex-1 min-h-0 overflow-hidden flex flex-col items-stretch relative px-4 md:px-8",
            "transition-all duration-700 ease-in-out",
            placement.canPlaceShip && "md:pr-[280px]"
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

            < PlayerSection
                boardVM={boardVM}

                interactive={
                    placement.canPlaceShip ||
                    flow.capabilities.canAttack
                }
                onCellHover={
                    supportsHover
                        ? placement.setTargetCell
                        : undefined
                }
                onCellLeave={
                    supportsHover
                        ? placement.onBoardLeave
                        : undefined
                }
                onCellPress={placement.onBoardInteraction}
            />

            {flow.capabilities.canAttack && (  
                <div className="w-full max-w-full flex items-center justify-center transition-transform duration-500">
                    <div className="flex-1 min-h-0 flex items-center justify-center py-2 sm:py-4">                                
                        <Board
                            boardVM={boardVM}
                            interactive={
                                placement.canPlaceShip ||
                                flow.capabilities.canAttack
                            }
                            onCellHover={
                                supportsHover
                                    ? placement.setTargetCell
                                    : undefined
                            }
                            onCellLeave={
                                supportsHover
                                    ? placement.onBoardLeave
                                    : undefined
                            }
                            onCellPress={placement.onBoardInteraction}
                        
                        />  
                    </div>
                </div>
            )}
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
