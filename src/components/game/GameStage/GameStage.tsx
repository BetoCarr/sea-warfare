"use client";
import React from 'react';

import Board from './../../board/Board';
import PlacementBar from './PlacementBar/PlacementBar';

import { useBoardViewModel } from '@/application/board/useBoardViewModel';
import { usePlacementKeyboardShortcuts } from '@/application/placement/interactions/usePlacementKeyboardShortcuts';

import type { GameInteractionCapabilities } from "@/application/game-flow/game-flow-types";
import type { PlacementController } from '@/application/placement/hooks/placement-controller.types';

import { cn } from '@/lib/utils/utils';

interface GameStageProps {
    capabilities: GameInteractionCapabilities;
    placement: PlacementController;
    supportsHover: boolean;
}

export const GameStage = ({
    capabilities,
    placement,
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
    
    return (
        <main
            className={cn(
                "flex-1 min-h-0 overflow-hidden",
                "flex flex-col items-center justify-start",
                "gap-10 pt-8 px-3",
                
                // Mobile Landscape
                "mobile-landscape:flex-row",
                "mobile-landscape:justify-center",
                "mobile-landscape:pt-0",
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
                <Board
                    boardVM={enemyBoardVM}
                    interactive={capabilities.canAttack}
                />
            )}
        </main>
    );
};