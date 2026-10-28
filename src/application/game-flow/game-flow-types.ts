export type GamePresentation = {
    phaseLabel: string;
    description: string | null;
};

export type GameFlowFeedbackEvent = {
    id: number;
    source: 'gameplay' | 'placement';
    message: string;
};

export type GameFlowContent = {
    instruction: string | null;
    feedback: GameFlowFeedbackEvent | null;
    stats: string | null;
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
    instruction: string | null;
    feedback: string | null;
    stats: string | null;
};