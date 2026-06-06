import { useMemo } from 'react';
import { STANDARD_FLEET } from '../../../lib/domain/ships/models/StandardFleet';
import { useGameplayStore } from '../../../lib/store/gameplay/gameplay-store';
import { usePlacementInteractionStore } from '../interactions/placement-interaction.store';
import { derivePlacementPreview } from '../derive/derivePlacementPreview';
import { derivePlacementAvailability } from '../derive/derivePlacementAvailability';
import { derivePlacementPresentation } from '../derive/derivePlacementPresentation';
import { placeShipOnBoard } from '@/lib/domain/placement/mutations/placeShipOnBoard';

import type { PlacementFlow } from './placement-flow.types';

export function usePlacementFlow(): PlacementFlow {
    const playerPlacements = useGameplayStore(
        state => state.playerPlacements,
    );

    const setPlayerPlacements =
        useGameplayStore(
            state => state.setPlayerPlacements,
        );
    
    const selectedShipType =
        usePlacementInteractionStore(
            state => state.selectedShipType,
        );
    
    const selectedShip =
        useMemo(
            () =>
                selectedShipType == null
                    ? null
                    : STANDARD_FLEET.find(
                        ship =>
                            ship.type ===
                            selectedShipType,
                    ) ?? null,
            [selectedShipType],
        );

    const orientation =
        usePlacementInteractionStore(
            state => state.orientation,
        );

    const hoveredCell =
        usePlacementInteractionStore(
            state => state.hoveredCell,
        );

    const setSelectedShipType =
        usePlacementInteractionStore(
            state => state.setSelectedShipType,
        );

    const setHoveredCell =
        usePlacementInteractionStore(
            state => state.setHoveredCell,
        );

    const setOrientation =
        usePlacementInteractionStore(
            state => state.setOrientation,
        );

    const preview = useMemo(
        () =>
            derivePlacementPreview({
                
                selectedShip,

                hoveredCell,
                
                orientation,

                existingPlacements:
                    playerPlacements,

            }),
        [
            playerPlacements,
            selectedShip,
            orientation,
            hoveredCell,
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
        shipType: typeof selectedShipType,
    ): void {
        setSelectedShipType(shipType);
    }

    function rotate(): void {
        setOrientation(
            orientation === 'horizontal'
                ? 'vertical'
                : 'horizontal',
        );
    }

    function placeShip(): void {
        if (
            !selectedShip ||
            !hoveredCell
        ) {
            return;
        }

        if (!preview) return;

        if (!preview.isValid) return;

        const existingPlacement =
            playerPlacements.find(
                placement =>
                    placement.ship.type === selectedShip.type,
            );

        const placement = {
            ship: selectedShip,
            origin: hoveredCell,
            orientation,
        };

        const result =
            placeShipOnBoard({
                existingPlacements:
                    playerPlacements,

                placement,
            });

        if (!result.success) {
            return;
        }

        setPlayerPlacements(
            result.placements,
        );

        setSelectedShipType(null);
    }

    function confirmFleet(): void {
        // TODO
    }

    return {
        selectedShipType,

        orientation,

        preview,

        availability,

        presentation,

        selectShip,

        setHoveredCell,

        rotate,
    
        placeShip,

        confirmFleet,
    };
}