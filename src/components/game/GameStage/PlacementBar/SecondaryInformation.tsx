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
        <div className="min-w-0 flex-1 pt-[clamp(0.25rem,1.5vw,1rem)] text-[clamp(0.5625rem,1.8vw,0.75rem)] font-mono text-slate-400">
            <div>
                Selected ship: {selectedShipType ?? 'None'}
            </div>

            <div>
                Orientation: {orientation}
            </div>
        </div>
    );
}