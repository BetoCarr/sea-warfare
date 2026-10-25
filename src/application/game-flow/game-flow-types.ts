export type GamePresentation = {
    phaseLabel: string;
    description: string | null;
    instruction: string | null;
};

export type GameInteractionCapabilities = {
    // Gameplay lifecycle
    canInitializeGame: boolean;
    canRestartGame: boolean;

    // Placement
    canPlaceFleet: boolean;
    canConfirmFleet: boolean;

    // Battle
    canAttack: boolean;
};

export type GameFlowController = {
    capabilities: GameInteractionCapabilities;
    presentation: GamePresentation;
};