import { Button } from "@/components/ui/Button";

import { useGameFlowController } from "@/application/game-flow/useGameFlowController";

import { usePlacementFlow } from "@/application/placement/hooks/usePlacementFlow";


interface HeaderProps {
  onInitialize?: () => void;
}

export function Header({ onInitialize }: HeaderProps) {

  const flow = useGameFlowController();
  const { canConfirmFleet, confirmFleet } = usePlacementFlow(); // Revisar si se puede recibir mediante props

  const renderAction = () => {
    if (flow.capabilities.canInitializeGame) {
        return (
            <Button 
                variant="success"
                onClick={onInitialize}
                pulse={true}
            >
                <span className="hidden sm:inline">
                    INITIALIZE SYSTEM
                </span>

                <span className="sm:hidden">
                    START
                </span>
            </Button>
        );
    }

    if (canConfirmFleet) {
        return (
            <Button 
                variant="success"
                onClick={confirmFleet}
                pulse={true}
            >
                <span className="sm:hidden">
                    CONFIRM
                </span>

                <span className="hidden sm:inline">
                    CONFIRM FLEET
                </span>
            </Button>
        );
    }

    if (flow.capabilities.canRestartGame) {
        return (
            <Button 
              variant="secondary"
              onClick={() => window.location.reload()} // TODO:
            >                                          // Replace full page reload with a proper game reset action
                REMATCH
            </Button>
        );
    }

    return null;
};

  return (
    <header className="h-14 flex-none flex items-center justify-between px-3 md:px-6 border-b border-slate-700/50 bg-slate-900 shadow-xl relative z-[60]">
      
      {/* LEFT: Identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-lg filter drop-shadow-sm">⚓</span>
          <span className="text-sm font-black tracking-tighter text-slate-100 hidden sm:block">
            SEA WARFARE
          </span>
        </div>
        <div className="h-4 w-px bg-slate-700 mx-1" />
      </div>

      {/* RIGHT: Primary Action */}
      <div className="min-w-[80px] flex justify-end">
        {renderAction()}
      </div>
    </header>
  );
}

