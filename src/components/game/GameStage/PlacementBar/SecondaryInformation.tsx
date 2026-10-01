import type { Orientation } from '@/lib/domain/placement/models/Orientation';
import type { ShipType } from '@/lib/domain/ships/models/ShipType';

interface SecondaryInformationProps {
    selectedShipType: ShipType | null;
    orientation: Orientation;
}

export default function SecondaryInformation({
    selectedShipType,
    orientation,
}: SecondaryInformationProps) {
    return (
        <div className="
            basis-[150px] min-w-0 flex-1
            text-[0.625rem] sm:text-xs
            font-mono text-slate-400"
        >
            <div>
                Selected ship: {selectedShipType ?? 'None'}
            </div>

            <div>
                Orientation: {orientation}
            </div>
        </div>
    );
}