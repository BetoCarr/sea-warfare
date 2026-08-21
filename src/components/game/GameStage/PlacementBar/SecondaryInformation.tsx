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
        <div>
            <div>Selected ship: {selectedShipType ?? 'None'}</div>
            <div>Orientation: {orientation}</div>
        </div>
    );
}