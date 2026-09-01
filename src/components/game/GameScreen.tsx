"use client";
import { Header } from "./Header";
import { GameStage } from "./GameStage/GameStage";

import { useSupportsHover } from "@/lib/device/useSupportsHover";
import { useGameplayStore } from "@/lib/store/gameplay-store";
import { useGameFlowController } from "@/application/game-flow/useGameFlowController";
import { usePlacementController } from "@/application/placement/hooks/usePlacementController";

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

    return (
        <div className="min-h-[100dvh] w-full bg-slate-900 text-slate-100 flex flex-col overflow-hidden relative">
            <Header 
                capabilities={flow.capabilities}
                onInitialize={handleInitialize} 
                onConfirmFleet={handleConfirmFleet}
            />
            <GameStage 
                capabilities={flow.capabilities}
                placement={placement}
                flow={flow}
                supportsHover={supportsHover}
            />
        </div>
    );
}