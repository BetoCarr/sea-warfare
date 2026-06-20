import { useMemo } from 'react';
import { STANDARD_FLEET } from '../../../lib/domain/ships/models/StandardFleet';
import { ShipType } from '@/lib/domain/ships/models/ShipType';
import { useGameplayStore } from '../../../lib/store/gameplay/gameplay-store';
import { usePlacementInteractionStore } from '../interactions/placement-interaction.store';
import { derivePlacementPreview } from '../derive/derivePlacementPreview';
import { derivePlacementAvailability } from '../derive/derivePlacementAvailability';
import { derivePlacementPresentation } from '../derive/derivePlacementPresentation';
import { upsertShipPlacement } from '@/lib/domain/placement/mutations/upsertShipPlacement';
import { GamePhase } from '@/lib/domain/game/game-types';
import type { PlacementFlow } from './placement-flow.types';
import type { Position } from '@/lib/domain/shared/models/Position';

export function usePlacementFlow(): PlacementFlow {

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
    
    const setPhase =
        useGameplayStore(
            state => state.setPhase,
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

    function onCellPress(position: Position): void {
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

    function confirmFleet(): void {
        if (!availability.allShipsPlaced) {
            return;
        }

        setPhase(GamePhase.BATTLE);
    }

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

        onCellPress,
    
        placeShip,

        confirmFleet,
    };
}