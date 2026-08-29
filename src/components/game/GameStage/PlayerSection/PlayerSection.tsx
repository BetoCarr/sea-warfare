import Board from '../../../board/Board';
import PlacementBar from '../PlacementBar/PlacementBar';

import type { BoardViewModel } from '@/application/board/board-types';
import type { PlacementController } from '@/application/placement/hooks/placement-controller.types';

import { BoardCellInteraction } from '@/application/placement/interactions/placement-interaction.types';
import { Position } from '@/lib/domain/shared/models/Position';

interface PlayerSectionProps {
    boardVM: BoardViewModel;
    interactive: boolean;
    placement: PlacementController;
    onCellHover?: (position: Position) => void;
    onCellLeave?: () => void;
    onCellPress?: (interaction: BoardCellInteraction) => void;
}

export default function PlayerSection(props: PlayerSectionProps) {

    const { interactive, placement } = props;

    return (
        <section className="flex-1 min-h-0 w-full max-w-full flex items-center justify-center gap-30 transition-transform duration-500">
            <Board {...props} />
            {interactive &&
                <PlacementBar
                    remainingShipTypes={placement.contract.stats.remainingShipTypes}
                    selectedShipType={placement.interaction.selectedShipType}
                    orientation={placement.interaction.orientation}
                    onSelectShip={placement.interaction.selectShip}
                    onRotate={placement.interaction.rotate}
                />
            }
        </section>
    );
}