import Board from '../../../board/Board';

import type { BoardViewModel } from '@/application/board/board-types';

import { BoardCellInteraction } from '@/application/placement/interactions/placement-interaction.types';
import { Position } from '@/lib/domain/shared/models/Position';

interface PlayerSectionProps {
    boardVM: BoardViewModel;
    interactive: boolean;
    onCellHover?: (position: Position) => void;
    onCellLeave?: () => void;
    onCellPress?: (interaction: BoardCellInteraction) => void;
}

export default function PlayerSection(props: PlayerSectionProps) {
    return (
        <section className="flex-1 min-h-0 w-full max-w-full flex items-center justify-center transition-transform duration-500">
            <div className="w-full min-h-0 flex items-center justify-center py-2 sm:py-4">
                <Board {...props} />
            </div>
        </section>
    );
}