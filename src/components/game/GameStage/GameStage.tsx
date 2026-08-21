"use client";
import React from 'react';

import { FeedbackMessage } from './FeedbackMessage';
import Board from '../../board/Board';

import PlayerSection from '../../game/GameStage/PlayerSection/PlayerSection';
import PlacementBar from './PlacementBar/PlacementBar';
import InformationPanel from './InformationPanel/InformationPanel';


import { useBoardViewModel } from '@/application/board/useBoardViewModel';

import { useGameFlowController } from '@/application/game-flow/useGameFlowController';

import { usePlacement } from '@/application/placement/hooks/usePlacement';

import { usePlacementKeyboardShortcuts } from '@/application/placement/interactions/usePlacementKeyboardShortcuts';

import { cn } from '@/lib/utils/utils';

interface GameStageProps {
    supportsHover: boolean;
    onPlayerCellClick: (row: number, col: number) => void;
}

export const GameStage = ({
    supportsHover,
    onPlayerCellClick,
}: GameStageProps) => {

    const placement = usePlacement();
    
    const flow = useGameFlowController({
        placementCapabilities: placement.contract.capabilities,
    });

    const boardVM = useBoardViewModel({
        boardVariant: 'player',
        size: 10,
        playerPlacements: placement.playerPlacements,
        preview: placement.preview,
        selectedShipType: placement.interaction.selectedShipType,
        showShips: true,
    });
    
    usePlacementKeyboardShortcuts({
        rotate: placement.interaction.rotate,
    });

    const instruction =
        flow.capabilities.canPlaceFleet
            ? placement.contract.instruction
            : flow.presentation.instruction;
    
    return (
        <main className={cn(
            "flex-1 min-h-0 overflow-hidden flex flex-col items-stretch relative px-4 md:px-8",
            "transition-all duration-700 ease-in-out",
        )}>
        
            {placement.contract.feedback && (
                <FeedbackMessage message={placement.contract.feedback} />
            )}

            < PlayerSection
                boardVM={boardVM}

                interactive={
                    flow.capabilities.canPlaceFleet ||
                    flow.capabilities.canAttack
                }
                onCellHover={
                    supportsHover
                        ? placement.interaction.setTargetCell
                        : undefined
                }
                onCellLeave={
                    supportsHover
                        ? placement.interaction.onBoardLeave
                        : undefined
                }
                onCellPress={placement.interaction.onBoardInteraction}
            />

            {/* 3. BOTTOM SLOT: Ship Palette */}
            {flow.capabilities.canPlaceFleet && (
                <PlacementBar 
                    remainingShipTypes={placement.contract.stats.remainingShipTypes}
                    selectedShipType={placement.interaction.selectedShipType}
                    onSelectShip={placement.interaction.selectShip}
                
                />
            )}

            {flow.capabilities.canAttack && (  
                <div className="w-full max-w-full flex items-center justify-center transition-transform duration-500">
                    <div className="flex-1 min-h-0 flex items-center justify-center py-2 sm:py-4">                                
                        <Board
                            boardVM={boardVM}
                            interactive={
                                flow.capabilities.canPlaceFleet ||
                                flow.capabilities.canAttack
                            }
                            onCellHover={
                                supportsHover
                                    ? placement.interaction.setTargetCell
                                    : undefined
                            }
                            onCellLeave={
                                supportsHover
                                    ? placement.interaction.onBoardLeave
                                    : undefined
                            }
                            onCellPress={placement.interaction.onBoardInteraction}
                        
                        />  
                    </div>
                </div>
            )}

            {instruction && (
                <InformationPanel
                    phaseLabel={flow.presentation.phaseLabel}
                    description={flow.presentation.description}
                    instruction={instruction}
                    stats={
                        flow.capabilities.canPlaceFleet
                            ? `Remaining ships: ${placement.contract.stats.remainingShips}`
                            : undefined
                    }
                />
            )}
        </main>
    );
};
