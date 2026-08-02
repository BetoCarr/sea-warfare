import { useMemo } from 'react';



import { STANDARD_FLEET } from '../../../lib/domain/ships/models/StandardFleet';

import { useGameplayStore } from '../../../lib/store/gameplay-store';

import { derivePlacementAvailability } from '../derive/derivePlacementStats';


import { derivePlacementPresentation } from '../derive/derivePlacementPresentation';

import { derivePlacementPreview } from '../derive/derivePlacementPreview';


import { usePlacementInteractionStore } from '../interactions/placement-interaction.store';

import { confirmFleet as confirmFleetDomain } from '@/lib/domain/game/mutations/confirmFleet';


import { upsertShipPlacement } from '@/lib/domain/placement/mutations/upsertShipPlacement';

import { ShipType } from '@/lib/domain/ships/models/ShipType';



import type { BoardCellInteraction } from '../interactions/placement-interaction.types';

import type { PlacementFlow } from './placement-flow.types';

export function usePlacementFlow(): PlacementFlow {

    const game = useGameplayStore (
        state => state.game,
    )

    const playerPlacements = useGameplayStore(
        state => state.playerPlacements,
    );

    const selectedShipType =
    usePlacementInteractionStore(
        state => state.selectedShipType,
    );

    const selectedShip =
        selectedShipType == null
            ? null
            : STANDARD_FLEET.find(
                ship =>
                    ship.type === selectedShipType,
            ) ?? null;

    const orientation =
        usePlacementInteractionStore(
            state => state.orientation,
        );

    const targetCell =
        usePlacementInteractionStore(
            state => state.targetCell,
        );

    const setPlayerPlacements =
        useGameplayStore(
            state => state.setPlayerPlacements,
        );
    
    const setSelectedShipType =
        usePlacementInteractionStore(
            state => state.setSelectedShipType,
        );

    const setTargetCell =
        usePlacementInteractionStore(
            state => state.setTargetCell,
        );
    
    const setOrientation =
        usePlacementInteractionStore(
            state => state.setOrientation,
        );

    const preview = useMemo(
        () =>
            derivePlacementPreview({
                
                selectedShip,

                targetCell,
                
                orientation,

                existingPlacements:
                    playerPlacements,

            }),
        [
            playerPlacements,
            selectedShip,
            orientation,
            targetCell,
        ],
    );

    const availability = useMemo(
        () =>
            derivePlacementAvailability({
                placements:
                    playerPlacements,

                requiredFleet: STANDARD_FLEET,
            }),
        [playerPlacements],
    );


    const presentation = useMemo(
        () =>
            derivePlacementPresentation({
                selectedShipType,
                preview,
                availability,
            }),
        [
            selectedShipType,
            preview,
            availability,
        ],
    );

    function selectShip(
        shipType: ShipType | null,
    ): void {
        setSelectedShipType(shipType);
        setTargetCell(null);
    }

    function rotate(): void {
        setOrientation(
            orientation === 'horizontal'
                ? 'vertical'
                : 'horizontal',
        );
    } 

    function onBoardInteraction(interaction: BoardCellInteraction): void {
        
        const { position, shipType } = interaction;

        if (selectedShipType) {
            const isSameCell =
                targetCell?.row === position.row &&
                targetCell?.col === position.col;

            if (isSameCell) {
                placeShip();
                return;
            }

            setTargetCell(position);
            return;
        }

        if (shipType) {
            selectShip(shipType);
            setTargetCell(position);
            return;
        }

        if (!targetCell) {
            setTargetCell(position);
            return;
        }

        const isSameCell =
            targetCell.row === position.row &&
            targetCell.col === position.col;

        if (!isSameCell) {
            setTargetCell(position);
            return;
        }

        placeShip();
    }

    function onBoardLeave(): void {

        if (selectedShipType) {
            return;
        }

        setTargetCell(null);
    }

    function placeShip(): void {

        if (
            !selectedShip ||
            !targetCell ||
            !preview?.isValid
        ) {
            return;
        }

        const placement = {
            ship: selectedShip,
            origin: targetCell,
            orientation,
        };

        const result = upsertShipPlacement({
            existingPlacements: playerPlacements,
            placement,
        });

        if (!result.success) {
            return;
        }

        setPlayerPlacements(result.placements);

        setSelectedShipType(null);

        setTargetCell(null);
    }

    const confirmFleet = () => {
        const nextGame = confirmFleetDomain({ game });
        useGameplayStore.getState().setGame(nextGame);
    };


    return {
        playerPlacements,
        
        selectedShipType,

        orientation,

        targetCell,

        preview,

        availability,

        presentation,

        selectShip,

        setTargetCell,

        rotate,

        onBoardInteraction,

        onBoardLeave,
    
        placeShip,

        confirmFleet,
    };
}