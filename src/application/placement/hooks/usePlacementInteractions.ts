import { usePlacementInteractionStore } from '../interactions/placement-interaction.store';
import { BoardCellInteraction, PlacementInteractionResult } from '../interactions/placement-interaction.types';

import { ShipType } from '@/lib/domain/ships/models/ShipType';
import { STANDARD_FLEET } from '../../../lib/domain/ships/models/StandardFleet';

import type { PlacementInteractionsContract } from './placement-interactions-contract.types';

export function usePlacementInteractions(): PlacementInteractionsContract {

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

    function onBoardInteraction(
        interaction: BoardCellInteraction,
    ): PlacementInteractionResult {

        const { position, shipType } = interaction;

        if (selectedShipType) {

            const isSameCell =
                targetCell?.row === position.row &&
                targetCell?.col === position.col;

            if (isSameCell) {
                return { type: 'place-ship' };
            }

            setTargetCell(position);
            return null;
        }

        if (shipType) {
            selectShip(shipType);
            setTargetCell(position);
            return null;
        }

        if (!targetCell) {
            setTargetCell(position);
            return null;
        }

        const isSameCell =
            targetCell.row === position.row &&
            targetCell.col === position.col;

        if (!isSameCell) {
            setTargetCell(position);
        }

        return null;
    }

    function onBoardLeave(): void {

        if (selectedShipType) {
            return;
        }

        setTargetCell(null);
    }

    return {
        selectedShipType,
        selectedShip,
        orientation,
        targetCell,

        selectShip,
        setTargetCell,
        rotate,

        onBoardInteraction,
        onBoardLeave,
    };
}