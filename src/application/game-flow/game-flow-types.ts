export type GamePresentation = {
    phaseLabel: string;
    description: string | null;
};

export type GameInteractionCapabilities = {
    canInitializeGame: boolean;
    canPlaceFleet: boolean;
    canConfirmFleet: boolean;
    canInteractWithBoard: boolean;
    canAttack: boolean;
    canRestartGame: boolean;
    canInteractWithEnemyBoard: boolean;
};