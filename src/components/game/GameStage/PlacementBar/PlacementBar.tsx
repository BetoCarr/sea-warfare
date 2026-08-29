import ShipPalette from './ShipPalette';
import { OrientationToggle } from './OrientationToggle';
import SecondaryInformation from './SecondaryInformation';
import { ShipType } from '@/lib/domain/ships/models/ShipType';
import { STANDARD_FLEET } from '@/lib/domain/ships/models/StandardFleet';
import { Orientation } from '@/lib/domain/placement/models/Orientation';

interface PlacementBarProps {
    remainingShipTypes: ShipType[];
    selectedShipType: ShipType | null;
    orientation: Orientation;
    onSelectShip: (shipType: ShipType) => void;
    onRotate: () => void;
}

export default function PlacementBar({
    remainingShipTypes,
    selectedShipType,
    orientation,
    onSelectShip,
    onRotate,
}: PlacementBarProps) {

    const remainingShips = STANDARD_FLEET.filter(ship =>
        remainingShipTypes.includes(ship.type),
    );

    return (
        <div className="w-[219px] h-[500px] flex flex-col bg-gray-800 p-2">
            <ShipPalette
                ships={remainingShips}
                selectedShipType={selectedShipType}
                onSelectShip={onSelectShip}
            />
            <OrientationToggle onToggle={onRotate} />
            <SecondaryInformation
                selectedShipType={selectedShipType}
                orientation={orientation}
            />
        </div>
    );
}