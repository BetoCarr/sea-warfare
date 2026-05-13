// import { useMemo } from 'react';
// import { useGameStore } from '@/lib/store/game-store';

// import { GamePhase } from '@/domain/game/GamePhase';
// import { GameStatus } from '@/domain/game/GameStatus';

// // import { deriveCapabilities } from './deriveCapabilities';

// // import { createPlacementBridge } from './bridges/createPlacementBridge';
// // import { createBattleBridge } from './bridges/createBattleBridge';
// // import { createGameOverBridge } from './bridges/createGameOverBridge';

// import type { BoardPosition } from '@/domain/shared/BoardPosition';
// import type { ShipType } from '@/domain/ship/ShipType';

// type GameInteractionCapabilities = {
//     canInitializeGame: boolean;

//     canPlaceShip: boolean;
//     canConfirmFleet: boolean;

//     canAttack: boolean;

//     canRestartGame: boolean;

//     canInteractWithBoard: boolean;
//     canInteractWithEnemyBoard: boolean;
// };

// type GameFlowInteractions = {
//     onBoardTap(position: BoardPosition): void;

//     onPrimaryAction(): void;

//     onRotate(): void;

//     onSelectShip(shipType: ShipType): void;
// };

// type PresentationState = {
//     aiThinking: boolean;

//     previewVisible: boolean;
// };

// type GameFlowViewModel = {
//     capabilities: GameInteractionCapabilities;

//     presentation: PresentationState;

//     interactions: GameFlowInteractions;
// };

// export function useGameFlowController(): GameFlowViewModel {
//     /**
//      * Raw store state
//      */

//     const phase = useGameStore(state => state.phase);
//     const status = useGameStore(state => state.status);

//     /**
//      * Placement state
//      */

//     const selectedShip = useGameStore(state => state.selectedShip);
//     const preview = useGameStore(state => state.preview);

//     /**
//      * Actions
//      */

//     const placeShip = useGameStore(state => state.placeShip);

//     const rotateShip = useGameStore(state => state.rotateShip);

//     const confirmFleet = useGameStore(state => state.confirmFleet);

//     const attackPosition = useGameStore(state => state.attackPosition);

//     const restartGame = useGameStore(state => state.restartGame);

//     /**
//      * Capabilities
//      */

//     const capabilities = useMemo(() => {
//         // return deriveCapabilities(phase, status);
//     }, [phase, status]);

//     /**
//      * Active bridge
//      */

//     const interactions: GameFlowInteractions = useMemo(() => {
//         switch (phase) {
//         case GamePhase.PLACEMENT:
//             return createPlacementBridge({
//                 placeShip,
//                 rotateShip,
//                 confirmFleet,
//             });

//         case GamePhase.BATTLE:
//             return createBattleBridge({
//                 attackPosition,
//             });

//         case GamePhase.GAME_OVER:
//             return createGameOverBridge({
//                 restartGame,
//             });

//         default:
//             return {
//                 onBoardTap: () => {},
//                 onPrimaryAction: () => {},
//                 onRotate: () => {},
//                 onSelectShip: () => {},
//             };
//         }
//     }, [
//         phase,

//         placeShip,
//         rotateShip,
//         confirmFleet,

//         attackPosition,

//         restartGame,
//     ]);

//     /**
//      * Presentation state
//      */

//     const presentation: PresentationState = {
//         aiThinking: status === GameStatus.AI_TURN,

//         previewVisible: !!preview && !!selectedShip,
//     };

//     /**
//      * Declarative ViewModel
//      */

//     return {
//         capabilities,
//         presentation,
//         interactions,
//     };
// }