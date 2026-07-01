import { useMemo } from 'react';
import { STANDARD_FLEET } from '../../../lib/domain/ships/models/StandardFleet';
import { ShipType } from '@/lib/domain/ships/models/ShipType';
import { useGameplayStore } from '../../../lib/store/gameplay/gameplay-store';
import { usePlacementInteractionStore } from '../interactions/placement-interaction.store';
import { derivePlacementPreview } from '../derive/derivePlacementPreview';
import { derivePlacementAvailability } from '../derive/derivePlacementAvailability';
import { derivePlacementPresentation } from '../derive/derivePlacementPresentation';
import { upsertShipPlacement } from '@/lib/domain/placement/mutations/upsertShipPlacement';
import { confirmFleet as confirmFleetDomain } from '@/lib/domain/game/mutations/confirmFleet';
import type { PlacementFlow } from './placement-flow.types';
import type { BoardCellInteraction } from '../interactions/placement-interaction.types';
import { PlacementState } from '@/lib/domain/placement/models/PlacementState';
import { derivePlacementState } from '../derive/derivePlacementState';
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

    const placementState = derivePlacementState({
        placements: playerPlacements,
        requiredFleetSize: 5, // o STANDARD_FLEET.length
    });

    //TEMPORAL
    const canConfirmFleet =
        placementState === PlacementState.FLEET_READY;

    // console.log(canConfirmFleet)

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



    const confirmFleet = () => { // SOLO CONFIRFLEET DEPENDE DE PLACEMENTSTATE
        if (placementState !== PlacementState.FLEET_READY) {
            return;
        }

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

        placementState,

        canConfirmFleet,

        selectShip,

        setTargetCell,

        rotate,

        onBoardInteraction,

        onBoardLeave,
    
        placeShip,

        confirmFleet,
    };
}