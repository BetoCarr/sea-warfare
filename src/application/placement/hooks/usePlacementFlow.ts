import { useMemo } from 'react';



import { STANDARD_FLEET } from '../../../lib/domain/ships/models/StandardFleet';

import { useGameplayStore } from '../../../lib/store/gameplay-store';



import { derivePlacementPreview } from '../derive/derivePlacementPreview';


import { usePlacementInteractionStore } from '../interactions/placement-interaction.store';

import { confirmFleet as confirmFleetDomain } from '@/lib/domain/game/mutations/confirmFleet';


import { upsertShipPlacement } from '@/lib/domain/placement/mutations/upsertShipPlacement';

import { ShipType } from '@/lib/domain/ships/models/ShipType';



import type { BoardCellInteraction } from '../interactions/placement-interaction.types';

import type { PlacementFlow } from './placement-flow.types';

// export function usePlacementFlow(): PlacementFlow {

    // const game = useGameplayStore (
    //     state => state.game,
    // )

    // const playerPlacements = useGameplayStore(
    //     state => state.playerPlacements,
    // );


    // const selectedShip =
    //     selectedShipType == null
    //         ? null
    //         : STANDARD_FLEET.find(
    //             ship =>
    //                 ship.type === selectedShipType,
    //         ) ?? null;


    // const setPlayerPlacements =
    //     useGameplayStore(
    //         state => state.setPlayerPlacements,
    //     );
    
    // const preview = useMemo(
    //     () =>
    //         derivePlacementPreview({
                
    //             selectedShip,

    //             targetCell,
                
    //             orientation,

    //             existingPlacements:
    //                 playerPlacements,

    //         }),
    //     [
    //         playerPlacements,
    //         selectedShip,
    //         orientation,
    //         targetCell,
    //     ],
    // );

    // const availability = useMemo(
    //     () =>
    //         derivePlacementAvailability({
    //             placements:
    //                 playerPlacements,

    //             requiredFleet: STANDARD_FLEET,
    //         }),
    //     [playerPlacements],
    // );


    // const presentation = useMemo(
    //     () =>
    //         derivePlacementPresentation({
    //             selectedShipType,
    //             preview,
    //             availability,
    //         }),
    //     [
    //         selectedShipType,
    //         preview,
    //         availability,
    //     ],
    // );



    // function placeShip(): void {

    //     if (
    //         !selectedShip ||
    //         !targetCell ||
    //         !preview?.isValid
    //     ) {
    //         return;
    //     }

    //     const placement = {
    //         ship: selectedShip,
    //         origin: targetCell,
    //         orientation,
    //     };

    //     const result = upsertShipPlacement({
    //         existingPlacements: playerPlacements,
    //         placement,
    //     });

    //     if (!result.success) {
    //         return;
    //     }

    //     setPlayerPlacements(result.placements);

    //     setSelectedShipType(null);

    //     setTargetCell(null);
    // }

    // const confirmFleet = () => {
    //     const nextGame = confirmFleetDomain({ game });
    //     useGameplayStore.getState().setGame(nextGame);
    // };


//     return {
//         playerPlacements,
        
//         // selectedShipType,

//         // orientation,

//         // targetCell,

//         preview,

//         // availability,

//         // presentation,

//         // selectShip,

//         // setTargetCell,

//         // rotate,

//         // onBoardInteraction,

//         // onBoardLeave,
    
//         placeShip,

//         confirmFleet,
//     };
// }