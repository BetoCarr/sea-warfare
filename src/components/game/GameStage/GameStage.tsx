"use client";
import React from 'react';

import { FeedbackMessage } from './FeedbackMessage';
import Board from '../../board/Board';

import PlayerSection from '../../game/GameStage/PlayerSection/PlayerSection';
import PlacementBar from './PlacementBar/PlacementBar';
import InformationPanel from './InformationPanel/InformationPanel';

import { useBoardViewModel } from '@/application/board/useBoardViewModel';
import { usePlacementKeyboardShortcuts } from '@/application/placement/interactions/usePlacementKeyboardShortcuts';

import type { GameInteractionCapabilities } from "@/application/game-flow/game-flow-types";
import type { PlacementController } from '@/application/placement/hooks/placement-controller.types';
import type { GameFlowController } from "@/application/game-flow/game-flow-types";

import { cn } from '@/lib/utils/utils';

interface GameStageProps {
    capabilites: GameInteractionCapabilities;
    placement: PlacementController;
    flow: GameFlowController;
    supportsHover: boolean;
}

export const GameStage = ({
    capabilites,
    placement,
    flow,
    supportsHover,
}: GameStageProps) => {


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
        capabilites.canPlaceFleet
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
            {capabilites.canPlaceFleet && (
                <PlacementBar 
                    remainingShipTypes={placement.contract.stats.remainingShipTypes}
                    selectedShipType={placement.interaction.selectedShipType}
                    orientation={placement.interaction.orientation}
                    onSelectShip={placement.interaction.selectShip}
                    onRotate={placement.interaction.rotate}
                />
            )}

            {capabilites.canAttack && (  
                <div className="w-full max-w-full flex items-center justify-center transition-transform duration-500">
                    <div className="flex-1 min-h-0 flex items-center justify-center py-2 sm:py-4">                                
                        <Board
                            boardVM={boardVM}
                            interactive={
                                capabilites.canPlaceFleet ||
                                capabilites.canAttack
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
