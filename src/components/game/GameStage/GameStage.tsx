"use client";
import React from 'react';

import { FeedbackMessage } from './FeedbackMessage';

import GameArea from './GameArea/GameArea';
import Board from './../../board/Board';
import PlacementBar from './PlacementBar/PlacementBar';
import InformationPanel from './InformationPanel/InformationPanel';

import { useBoardViewModel } from '@/application/board/useBoardViewModel';
import { usePlacementKeyboardShortcuts } from '@/application/placement/interactions/usePlacementKeyboardShortcuts';

import type { GameInteractionCapabilities } from "@/application/game-flow/game-flow-types";
import type { PlacementController } from '@/application/placement/hooks/placement-controller.types';
import type { GameFlowController } from "@/application/game-flow/game-flow-types";

import { cn } from '@/lib/utils/utils';

interface GameStageProps {
    capabilities: GameInteractionCapabilities; // Revisar si debemos eliminar este prop y obtener capabilites de
    placement: PlacementController;
    flow: GameFlowController;
    supportsHover: boolean;
}

export const GameStage = ({
    capabilities,
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

    const enemyBoardVM = useBoardViewModel({
        boardVariant: 'enemy',
        size: 10,
        showShips: false,
    });
    
    usePlacementKeyboardShortcuts({
        rotate: placement.interaction.rotate,
    });

    const instruction =
        capabilities.canPlaceFleet
            ? placement.contract.instruction
            : flow.presentation.instruction;
    
    return (
        <main
            className={cn(
                // Base — Mobile Portrait
                "flex-1 min-h-0 overflow-hidden",
                "flex flex-col items-stretch",
                "relative px-4",

                // Mobile / Tablet Landscape
                "max-lg:landscape:flex-row",

                // Transitions
                "transition-all duration-700 ease-in-out",
            )}
        >
            {placement.contract.feedback && (
                <FeedbackMessage message={placement.contract.feedback} />
            )}

            <GameArea>
                <div
                    className={cn(
                        // Base — Mobile Portrait
                        "w-[300px] h-[300px]",

                        // Tablet Portrait
                        "[@media_(min-width:768px)_and_(orientation:portrait)]:w-[500px]",
                        "[@media_(min-width:768px)_and_(orientation:portrait)]:h-[500px]",

                        // Mobile Landscape
                        // "[@media_(min-width:768px)_and_(max-width:1023px)_and_(orientation:landscape)]:w-[328px]",
                        // "[@media_(min-width:768px)_and_(max-width:1023px)_and_(orientation:landscape)]:h-[294px]",

                        // Tablet Landscape / Desktop
                        "lg:w-[500px] lg:h-[500px]",

                        // Available space
                        "max-w-full max-h-full shrink-0",
                    )}
                >
                    <Board
                        boardVM={boardVM}
                        interactive={capabilities.canPlaceFleet}
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


                {capabilities.canPlaceFleet && (
                    <PlacementBar
                        remainingShipTypes={placement.contract.stats.remainingShipTypes}
                        selectedShipType={placement.interaction.selectedShipType}
                        orientation={placement.interaction.orientation}
                        onSelectShip={placement.interaction.selectShip}
                        onRotate={placement.interaction.rotate}
                    />
                )}

                {capabilities.canAttack && (
                    <div
                        className={cn(
                            // Base — Mobile Portrait
                            "w-[300px] h-[300px]",

                            // Tablet / Desktop
                            "md:w-[500px] md:h-[500px]",

                            // Mobile Landscape — limited height
                            "[@media_(orientation:landscape)_and_(max-height:600px)]:w-[328px]",
                            "[@media_(orientation:landscape)_and_(max-height:600px)]:h-[294px]",

                            // Available space
                            "max-w-full max-h-full shrink-0",
                        )}
                    >
                        <Board
                            boardVM={enemyBoardVM}
                            interactive={capabilities.canAttack}
                        />
                    </div>
                )}
            </GameArea>

            {instruction && (
                <InformationPanel
                    phaseLabel={flow.presentation.phaseLabel}
                    description={flow.presentation.description}
                    instruction={instruction}
                    stats={
                        capabilities.canPlaceFleet
                            ? `Remaining ships: ${placement.contract.stats.remainingShips}`
                            : undefined
                    }
                />
            )}
        </main>
    );
};