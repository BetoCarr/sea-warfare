import Board from '../../../board/Board';

import type { BoardViewModel } from '@/application/board/board-types';

interface EnemySectionProps {
    boardVM: BoardViewModel;
}

export default function EnemySection({ boardVM }: EnemySectionProps) {
    return (
        <section className="w-full max-w-full flex items-center justify-center transition-transform duration-500">
            <div className="flex-1 min-h-0 flex items-center justify-center py-2 sm:py-4">
                <Board boardVM={boardVM} />
            </div>
        </section>
    );
}