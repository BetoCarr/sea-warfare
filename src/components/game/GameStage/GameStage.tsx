"use client";
import React from 'react';

import { FeedbackMessage } from './FeedbackMessage';

import PlayerSection from '../../game/GameStage/PlayerSection/PlayerSection';
import EnemySection from './EnemySection/EnemySection';
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

    const enemyBoardVM = useBoardViewModel({
        boardVariant: 'enemy',
        size: 10,
        showShips: false,
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
                    flow.capabilities.canPlaceFleet 
                }

                placement={placement}

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
            {/* {capabilites.canPlaceFleet && (
                <PlacementBar 
                    remainingShipTypes={placement.contract.stats.remainingShipTypes}
                    selectedShipType={placement.interaction.selectedShipType}
                    orientation={placement.interaction.orientation}
                    onSelectShip={placement.interaction.selectShip}
                    onRotate={placement.interaction.rotate}
                />
            )} */}

            {capabilites.canAttack && (
                <EnemySection boardVM={enemyBoardVM} />
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
