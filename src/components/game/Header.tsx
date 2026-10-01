import { Button } from "@/components/ui/Button";

import { cn } from "@/lib/utils/utils";

import type { GameInteractionCapabilities } from "@/application/game-flow/game-flow-types";

interface HeaderProps {
    capabilities : GameInteractionCapabilities;
    onInitialize?: () => void;
    onConfirmFleet?: () => void;
}

export function Header({capabilities, onInitialize, onConfirmFleet }: HeaderProps) {

    const renderAction = () => {
        if (capabilities.canInitializeGame) {
            return (
                <Button 
                    onClick={onInitialize}
                >
                    <span className="hidden mobile-landscape:inline">
                        INITIALIZE SYSTEM
                    </span>

                    <span className="mobile-landscape:hidden">
                        START
                    </span>
                    {/* <span className="hidden sm:inline">
                        INITIALIZE SYSTEM
                    </span>

                    <span className="sm:hidden">
                        START
                    </span> */}
                </Button>
            );
        }

        if (capabilities.canConfirmFleet) {
            return (
                <Button 
                    onClick={onConfirmFleet}
                >
                    <span className="mobile-landscape:hidden">
                        CONFIRM
                    </span>

                    <span className="hidden mobile-landscape:inline">
                        CONFIRM FLEET
                    </span>
                    {/* <span className="sm:hidden">
                        CONFIRM
                    </span>
                    <span className="hidden sm:inline">
                        CONFIRM FLEET
                    </span> */}
                </Button>
            );
        }

        return null;
    };

    return (
        <header
            className={cn(
                "flex-none flex items-center justify-between",
                "h-[58px]",
                "px-3",
                "border-b border-slate-700/50",
                "bg-slate-800",
                "shadow-xl",
                "relative z-[60]",

                // Tablet portrait
                "tablet-portrait:h-[70px]"
            )}
        >
            {/* LEFT: Identity */}
            <div className="flex items-center gap-3">
                <span className="text-lg filter drop-shadow-sm">⚓</span>
                <span className="text-sm font-black tracking-tighter text-slate-100 hidden sm:block">
                    SEA WARFARE
                </span>
                <div className="h-4 w-px bg-slate-700 mx-1" />
            </div>

            {/* RIGHT: Primary Action */}
            <div className="w-fit min-w-20 h-9">
                {renderAction()}
            </div>
        </header>
    );
}

