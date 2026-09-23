"use client";
import { Header } from "./Header";
import { GameStage } from "./GameStage/GameStage";
import InformationPanel from "../game/GameStage/InformationPanel/InformationPanel";

import { useSupportsHover } from "@/lib/device/useSupportsHover";
import { useGameplayStore } from "@/lib/store/gameplay-store";
import { useGameFlowController } from "@/application/game-flow/useGameFlowController";
import { usePlacementController } from "@/application/placement/hooks/usePlacementController";
import { FeedbackMessage } from "./GameStage/FeedbackMessage";

export function GameScreen() {
    const supportsHover = useSupportsHover();

    const initializeGame = useGameplayStore(
        state => state.initializeGame
    );

    const confirmFleet = useGameplayStore(
        state => state.confirmFleet
    );

    const handleInitialize = () => {
        initializeGame();
    };

    const handleConfirmFleet = () => {
        confirmFleet();
    }

    const placement = usePlacementController();

    const flow = useGameFlowController({
        placementCapabilities: placement.contract.capabilities,
    });

    const instruction =
        flow.capabilities.canPlaceFleet
            ? placement.contract.instruction
            : flow.presentation.instruction;

    return (
        <div className="flex-1 min-h-0 bg-slate-900 text-slate-100 flex flex-col overflow-hidden relative">
            {placement.contract.feedback && (
                <FeedbackMessage message={placement.contract.feedback} />
            )}  
            <Header 
                capabilities={flow.capabilities}
                onInitialize={handleInitialize} 
                onConfirmFleet={handleConfirmFleet}
            />
            <GameStage 
                capabilities={flow.capabilities}
                placement={placement}
                supportsHover={supportsHover}
            />
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
        </div>
    );
}